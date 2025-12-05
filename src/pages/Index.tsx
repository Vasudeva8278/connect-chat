import { ChatApp } from '@/components/chat/ChatApp';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>ChatApp - WhatsApp Style Messaging</title>
        <meta name="description" content="A modern WhatsApp-style chat application with real-time messaging, OTP authentication, and beautiful UI." />
      </Helmet>
      <ChatApp />
    </>
  );
};

export default Index;
