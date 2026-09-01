import { useEffect, useRef, type RefObject } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

type SignatureWidgetProps = {
  heroRef?: RefObject<HTMLElement | null>
}

export default function SignatureWidget({ heroRef }: SignatureWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 70, damping: 18, mass: 0.8 })
  const springY = useSpring(mouseY, { stiffness: 70, damping: 18, mass: 0.8 })

  const { scrollYProgress } = useScroll({
    target: heroRef ?? widgetRef,
    offset: ['start start', 'end start'],
  })

  const scrollLift = useTransform(scrollYProgress, [0, 1], [0, -48])
  const scrollFade = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.55, 0])
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [0, -8])

  useEffect(() => {
    if (reduceMotion) return undefined

    const hero = heroRef?.current ?? widgetRef.current?.closest('.hero')
    if (!hero) return undefined

    const onMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      mouseX.set(nx * 28)
      mouseY.set(ny * 20)
    }

    const onLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    return () => {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [heroRef, mouseX, mouseY, reduceMotion])

  return (
    <div
      ref={widgetRef}
      className="hero-signature"
      aria-hidden="true"
    >
      <motion.div
        className="hero-signature-inner"
        style={
          reduceMotion
            ? undefined
            : {
                x: springX,
                y: scrollLift,
                opacity: scrollFade,
                rotate: scrollTilt,
              }
        }
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.48, duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.svg
          className="hero-signature-line"
          viewBox="0 0 620 760"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={reduceMotion ? undefined : { y: springY }}
        >
          <motion.path
            d="M584 46C470 92 515 209 395 240C270 272 161 183 92 278C17 381 111 495 249 451C391 406 443 505 359 613C302 687 188 671 102 724"
            stroke="rgba(255,255,255,.66)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d="M603 70C469 117 535 243 385 263C238 283 133 212 74 318C16 422 139 523 270 462C372 415 446 508 386 605"
            stroke="rgba(184,28,34,.92)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.55, duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.svg>

        <motion.div
          className="hero-signature-seal"
          style={reduceMotion ? undefined : { x: springX, y: springY }}
          animate={reduceMotion ? undefined : { rotate: [0, 2.5, 0, -2.5, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="hero-signature-seal-word">УНО</span>
          <span className="hero-signature-seal-note">Саратов</span>
        </motion.div>

        <span className="hero-signature-caption">Линия вашего образа</span>
      </motion.div>
    </div>
  )
}
