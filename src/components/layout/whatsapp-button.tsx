'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = '5519998256810'
const WHATSAPP_MESSAGE =
  'Olá! Gostaria de saber mais sobre os produtos Prado Calçados.'

export function WhatsAppButton() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 1 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <FaWhatsapp  size={28} />
    </motion.a>
  )
}
