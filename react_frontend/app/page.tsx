import OnboardingFlow from "@/components/onboarding-flow"

export default function Home() {
  return (
    <OnboardingFlow
      redirectPath="/home"
      onComplete={(profile) => {
        console.log("Onboarding completed:", profile)
      }}
    />
  )
}
