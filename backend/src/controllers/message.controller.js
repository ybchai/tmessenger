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

    const message = await createMessage({
      conversationId,
      senderId,
      originalText: text,
      imageUrl,
      videoUrl,
    });

    // Update sidebar ordering
    await updateConversationTimestamp(conversationId);

    // Translation
    if (text) {
      const targetLanguage = await getReceiverLanguage(
        conversationId,
        senderId,
      );

      if (targetLanguage) {
        const translation = await translateText(text, targetLanguage);

        await createTranslation({
          messageId: message.id,
          languageCode: targetLanguage,
          translatedText: translation.translatedText,
        });
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
