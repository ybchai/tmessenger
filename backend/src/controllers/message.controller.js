import {
  getMessagesByConversation,
  createMessage,
  getReceiverLanguage,
  updateConversationTimestamp,
} from "../repositories/message.repository.js";

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

    console.log("Send message request:", {
      conversationId,
      senderId,
      text,
    });

    let imageUrl = null;
    let videoUrl = null;

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

    console.log("Creating message...");

    const message = await createMessage({
      conversationId,
      senderId,
      originalText: text,
      imageUrl,
      videoUrl,
    });

    const formattedMessage = {
      id: message.id,
      text: message.original_text,
      imageUrl: message.image_url,
      videoUrl: message.video_url,
      time:  new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      role: message.sender_id === senderId ? "me" : "other",
    };

    console.log("Message created:", message.id);

    console.log("Updating conversation timestamp...");

    await updateConversationTimestamp(conversationId);

    // Translation should not break message sending
    if (text) {
      try {
        console.log("Getting receiver language...");

        const targetLanguage = await getReceiverLanguage(
          conversationId,
          senderId,
        );

        console.log("Receiver language:", targetLanguage);

        if (targetLanguage) {
          console.log("Translating text...");

          const translation = await translateText(text, targetLanguage);

          console.log("Translation created, saving to database...");

          await createTranslation({
            messageId: message.id,
            languageCode: targetLanguage,
            translatedText: translation.translatedText,
          });
        }
      } catch (translationError) {
        console.error("Translation failed:", translationError.message);

        // Do not fail the message request
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
