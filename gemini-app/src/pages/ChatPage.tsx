import React, { useState, FormEvent, useEffect, useRef } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosConfig";
import { useDispatch } from "react-redux";
import { setInitialized } from "../store/user";

function ChatPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, isThinking]);

  const handleLogout = () => {
    // TODO: 여기에 로그아웃 프로세스를 구현하세요.
    dispatch(setInitialized());
    console.log("로그아웃 버튼 클릭됨");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() || isThinking) return;

    const newHistory: HistoryItem[] = [
      ...history,
      { type: "prompt", text: query },
    ];
    setHistory(newHistory);
    setQuery("");
    setIsThinking(true);

    try {
      const res = await axiosInstance.post("gemini/send-prompt", {
        prompt: query,
      });

      if (res.data) {
        // const output = res.data.output.map((item: string) => {
        //   return item;
        // });
        const output = res.data.output;
        // alert(JSON.stringify(output));
        setHistory([...newHistory, { type: "response", text: output }]);
      }
    } catch (error) {
      console.error("Error sending prompt:", error);
      setHistory([
        ...newHistory,
        {
          type: "response",
          text: "오류가 발생했습니다. 서버에 연결할 수 없습니다.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AppContainer>
      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      <ChatContainer>
        <ChatBody ref={terminalBodyRef}>
          <MessageContainer>
            <IntroText>무엇이든 물어보세요! ✨</IntroText>
            {history.map((item, index) => (
              <Message key={index} $isUser={item.type === "prompt"}>
                <MessageBubble $isUser={item.type === "prompt"}>
                  <p>{item.text}</p>
                </MessageBubble>
              </Message>
            ))}
            {isThinking && (
              <Message>
                <ThinkingIndicator>
                  <span></span>
                  <span></span>
                  <span></span>
                </ThinkingIndicator>
              </Message>
            )}
          </MessageContainer>
        </ChatBody>
        <ChatForm onSubmit={handleSubmit}>
          <ChatInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="메시지를 입력하세요..."
            autoFocus
            disabled={isThinking}
          />
          <SendButton type="submit" disabled={isThinking}>
            전송
          </SendButton>
        </ChatForm>
      </ChatContainer>
    </AppContainer>
  );
}

interface HistoryItem {
  type: "prompt" | "response";
  text: string;
}

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 20px;
  position: relative; /* 자식 요소의 absolute 포지셔닝을 위해 추가 */
  box-sizing: border-box;
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 900px;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const IntroText = styled.p`
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 30px;
  animation: fadeIn 0.6s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Message = styled.div<{ $isUser?: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 70%;
  padding: 16px 20px;
  border-radius: ${(props) =>
    props.$isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px"};
  background: ${(props) =>
    props.$isUser
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "#f5f5f7"};
  color: ${(props) => (props.$isUser ? "#ffffff" : "#2d3748")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  line-height: 1.6;

  p {
    margin: 0;
    font-size: 15px;
  }
`;

const ThinkingIndicator = styled.div`
  display: flex;
  gap: 6px;
  padding: 16px 20px;
  background: #f5f5f7;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ChatForm = styled.form`
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 15px;
  background: #f5f5f7;
  transition: all 0.3s ease;
  outline: none;

  &:focus {
    background: #ffffff;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 25px;
  right: 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

export default ChatPage;
