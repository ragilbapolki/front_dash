<template>
  <div>
    <!-- Tombol chat mengambang -->
    <button
      class="chat-toggle"
      @click="isOpen = !isOpen"
      :class="{ 'chat-open': isOpen }"
    >
      <svg v-if="!isOpen" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>
      <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Kotak chat -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-box">
        <div class="chat-header">
          <div class="header-content">
            <div class="avatar-wrapper">
              <div class="avatar">
                <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div class="status-dot"></div>
            </div>
            <div class="header-text">
              <h4>AI Assistant</h4>
              <span class="status-text">Online - Siap membantu</span>
            </div>
          </div>
          <button class="minimize-btn" @click="isOpen = false">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        <div class="chat-body" ref="chatBody">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-icon">👋</div>
            <h3>Halo! Ada yang bisa saya bantu?</h3>
            <p>Tanyakan seputar artikel, SOP, panduan, atau kebijakan di Knowledge Base</p>
            <div class="quick-questions">
              <button
                v-for="(q, i) in quickQuestions"
                :key="i"
                @click="askQuestion(q)"
                class="quick-question-btn"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <!-- Chat Messages -->
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['chat-message', msg.sender]"
          >
            <div v-if="msg.sender === 'ai'" class="message-avatar">
              <svg class="avatar-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div class="message-bubble">
              <p>{{ msg.text }}</p>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="loading" class="chat-message ai">
            <div class="message-avatar">
              <svg class="avatar-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div class="message-bubble typing">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <button class="emoji-btn" title="Coming soon">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          <input
            v-model="question"
            type="text"
            placeholder="Ketik pertanyaan Anda..."
            @keyup.enter="sendMessage"
            :disabled="loading"
          />
          <button
            @click="sendMessage"
            :disabled="loading || !question.trim()"
            class="send-btn"
          >
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>

        <!-- Powered by -->
        <div class="chat-footer">
          <span>Powered by AI Knowledge Base</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import axios from "axios";

const isOpen = ref(false);
const question = ref("");
const messages = ref([]);
const loading = ref(false);
const chatBody = ref(null);

const quickQuestions = [
  "Bagaimana cara mengakses SOP?",
  "Panduan SAP terbaru",
  "Kebijakan cuti karyawan"
];

const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const askQuestion = (q) => {
  question.value = q;
  sendMessage();
};

const sendMessage = async () => {
  if (!question.value.trim() || loading.value) return;

  const userMessage = question.value.trim();
  messages.value.push({
    sender: "user",
    text: userMessage,
    timestamp: new Date()
  });
  question.value = "";
  loading.value = true;
  await scrollToBottom();

  try {

    const { data } = await axios.post("/api/v1/chat", { question: userMessage });
    // const { data } = await axios.post("/api/v1/chat", { question: userMessage });
    messages.value.push({
      sender: "ai",
      text: data.answer || "Maaf, saya tidak menemukan jawaban.",
      timestamp: new Date()
    });
  } catch (error) {
    messages.value.push({
      sender: "ai",
      text: "Terjadi kesalahan pada server. Silakan coba lagi.",
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Tombol chat melayang */
.chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 9998;
}

.chat-toggle:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(22, 163, 74, 0.5);
}

.chat-toggle.chat-open {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
}

.chat-toggle .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

/* Kotak chat */
.chat-box {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 600px;
  max-height: calc(100vh - 140px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  animation: slideUp 0.3s ease-out;
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.header-text h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.status-text {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 400;
}

.minimize-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.minimize-btn .icon {
  width: 20px;
  height: 20px;
}

/* Body */
.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.chat-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Welcome Message */
.welcome-message {
  text-align: center;
  padding: 40px 20px;
  animation: fadeIn 0.5s ease-out;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.welcome-message h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.welcome-message p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-question-btn {
  padding: 12px 16px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-weight: 500;
}

.quick-question-btn:hover {
  background: #f0fdf4;
  border-color: #16a34a;
  color: #16a34a;
  transform: translateX(4px);
}

/* Chat Messages */
.chat-message {
  display: flex;
  margin-bottom: 16px;
  animation: slideUp 0.3s ease-out;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.ai {
  justify-content: flex-start;
  gap: 8px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.avatar-icon-small {
  width: 18px;
  height: 18px;
  color: white;
  stroke-width: 2;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.chat-message.ai .message-bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-bubble p {
  margin: 0 0 4px 0;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  display: block;
  margin-top: 4px;
}

/* Typing Indicator */
.message-bubble.typing {
  padding: 16px 20px;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

/* Input */
.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  align-items: center;
}

.emoji-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.emoji-btn:hover {
  background: #f3f4f6;
  color: #16a34a;
}

.emoji-btn .icon {
  width: 20px;
  height: 20px;
}

.chat-input input {
  flex: 1;
  border: 1.5px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.chat-input input:focus {
  border-color: #16a34a;
  background: white;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.chat-input input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

/* Footer */
.chat-footer {
  padding: 12px 16px;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

/* Responsive */
@media (max-width: 480px) {
  .chat-toggle {
    width: 56px;
    height: 56px;
    bottom: 20px;
    right: 20px;
  }

  .chat-toggle .icon {
    width: 24px;
    height: 24px;
  }

  .chat-box {
    bottom: 88px;
    right: 20px;
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
  }

  .chat-header {
    padding: 16px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .avatar-icon {
    width: 20px;
    height: 20px;
  }

  .header-text h4 {
    font-size: 15px;
  }

  .status-text {
    font-size: 11px;
  }

  .chat-body {
    padding: 16px;
  }

  .message-bubble {
    max-width: 85%;
    font-size: 13px;
  }

  .welcome-message {
    padding: 30px 16px;
  }

  .welcome-icon {
    font-size: 40px;
  }

  .welcome-message h3 {
    font-size: 18px;
  }
}
</style>
