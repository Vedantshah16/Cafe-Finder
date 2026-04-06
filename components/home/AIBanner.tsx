'use client';

import { motion } from 'framer-motion';
import { Sparkles, Dices, MessageCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Recommendations',
    description: 'Describe what you want in plain English and our AI finds the best match.',
    action: () => {},
    label: 'Try now',
    accent: '#D4A853',
  },
  {
    icon: Dices,
    title: 'Spin the Wheel',
    description: 'Can\'t decide? Let the wheel of fate pick your next cafe adventure.',
    action: 'spin',
    label: 'Spin now',
    accent: '#E8536A',
  },
  {
    icon: MessageCircle,
    title: 'AI Cafe Concierge',
    description: 'Chat with CafeBot for personalized recommendations and tips.',
    action: 'chat',
    label: 'Start chatting',
    accent: '#5B8AF0',
  },
];

export default function AIBanner() {
  const { toggleSpinWheel, toggleChat } = useAppStore();
  const router = useRouter();

  const handleAction = (action: string | (() => void)) => {
    if (action === 'spin') toggleSpinWheel();
    else if (action === 'chat') toggleChat();
    else router.push('/explore');
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-accent text-sm font-medium mb-3 tracking-wider uppercase">
            Powered by AI
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            More than just a cafe finder
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Our AI-powered features make discovering your next favourite spot effortless and fun.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, action, label, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group relative bg-surface border border-border rounded-3xl p-6 overflow-hidden cursor-pointer"
              onClick={() => handleAction(action)}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${accent}10, transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
              >
                <Icon size={22} style={{ color: accent }} />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">{description}</p>

              <button
                className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                style={{ color: accent }}
              >
                {label}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
