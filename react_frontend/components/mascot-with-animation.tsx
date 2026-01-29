"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"

interface MascotWithAnimationProps {
  className?: string
  staticImageSrc: string
  alt: string
  lottieData?: any
}

export default function MascotWithAnimation({
  className = "",
  staticImageSrc,
  alt,
  lottieData,
}: MascotWithAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [lottieInstance, setLottieInstance] = useState<any>(null)

  useEffect(() => {
    let lottie: any = null

    const loadLottie = async () => {
      if (typeof window !== "undefined" && lottieData) {
        try {
          // Dynamically import lottie-web only on client side
          const lottieWeb = await import("lottie-web")
          lottie = lottieWeb.default

          if (containerRef.current) {
            const animation = lottie.loadAnimation({
              container: containerRef.current,
              renderer: "svg",
              loop: true,
              autoplay: false,
              animationData: lottieData,
            })

            setLottieInstance(animation)
          }
        } catch (error) {
          console.log("[v0] Lottie loading failed, using CSS fallback:", error)
        }
      }
    }

    loadLottie()

    return () => {
      if (lottieInstance) {
        lottieInstance.destroy()
      }
    }
  }, [lottieData])

  useEffect(() => {
    if (lottieInstance) {
      if (isHovered) {
        lottieInstance.play()
      } else {
        lottieInstance.stop()
      }
    }
  }, [isHovered, lottieInstance])

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Static Image - Always visible */}
      <Image
        src={staticImageSrc || "/placeholder.svg"}
        alt={alt}
        width={208}
        height={208}
        className={`w-52 h-52 object-contain drop-shadow-lg transition-all duration-300 ${
          !lottieData || !lottieInstance
            ? isHovered
              ? "animate-bounce scale-105"
              : "animate-pulse"
            : isHovered
              ? "opacity-0"
              : "opacity-100"
        }`}
      />

      {/* Lottie Animation Container - Only visible on hover when Lottie is loaded */}
      {lottieData && (
        <div
          ref={containerRef}
          className={`absolute inset-0 w-52 h-52 transition-opacity duration-300 ${
            isHovered && lottieInstance ? "opacity-100" : "opacity-0"
          }`}
          style={{ pointerEvents: "none" }}
        />
      )}
    </div>
  )
}
