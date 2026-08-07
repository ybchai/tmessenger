import {
  getMessagesByConversation,
  createMessage,
  getReceiverLanguage,
  updateConversationTimestamp,
} from "../repositories/message.repository.js";

import { io } from "../sockets/socket.js";

import { createTranslation } from "../repositories/translation.repository.js";

import { translateText } from "../services/translation.service.js";

import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

export async function getMessages(req, res) {
  try {
    const { id } = req.params;

    const messages = await getMessagesByConversation(id);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;

    const { id: conversationId } = req.params;

    const { text } = req.body;

    let imageUrl = null;
    let videoUrl = null;
    let targetLanguage = null;
    let translatedText = null;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({
          error: "Media upload not configured",
        });
      }

      const url = await uploadChatMedia(req.file);

      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    let sourceLanguage = null;

    // Detect source language
    if (text) {
      try {
        const detection = await translateText(text, "en");

        sourceLanguage = detection.detectedLanguage?.toLowerCase();

        console.log("Detected language:", sourceLanguage);
      } catch (error) {
        console.error("Language detection failed:", error.message);
      }
    }

    console.log("Creating message...");

    const message = await createMessage({
      conversationId,
      senderId,
      originalText: text,
      sourceLanguage,
      imageUrl,
      videoUrl,
    });

    console.log("Message created:", message);

    await updateConversationTimestamp(conversationId);

    // Create translation
    if (text) {
      try {
        targetLanguage = await getReceiverLanguage(conversationId, senderId);

        console.log("Receiver language:", targetLanguage);

        if (targetLanguage && targetLanguage.toLowerCase() !== sourceLanguage) {
          const translation = await translateText(text, targetLanguage);

          translatedText = translation.translatedText;

          await createTranslation({
            messageId: message.id,
            languageCode: targetLanguage.toLowerCase(),
            translatedText,
          });

          console.log("Translation saved");
        } else {
          console.log("Skipping translation - same language");
        }
      } catch (error) {
        console.error("Translation failed:", error.message);
      }
    }

    const formattedMessage = {
      id: message.id,

      originalText: message.original_text,
      translatedText,

      sourceLanguage,
      targetLanguage,

      imageUrl: message.image_url,
      videoUrl: message.video_url,

      time: new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    io.to(conversationId).emit("receive_message", formattedMessage);

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error("Send message error:", error.message);

    console.error(error.stack);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
