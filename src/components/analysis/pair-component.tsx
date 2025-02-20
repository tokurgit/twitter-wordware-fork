'use client'

import { useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

import { SelectPair, SelectUser } from '@/drizzle/schema'
import { useCompatibilityAnalysis } from '@/hooks/compatibility-analysis'

import ActionButtons from './action-buttons'
import Compatibility from './compatibility'
import { CompatibilityPriceButton } from './compatibility-paywall-card'
import { ProgressIndicator, StepIndicator } from './progress-indicator'

const PairComponent = ({ users, pair }: { users: SelectUser[]; pair: SelectPair }) => {
  const [user1, user2] = users.sort()
  const searchParams = useSearchParams()
  const { steps, user1Steps, user1Result, user2Steps, user2Result, compatibilityResult, unlocked } = useCompatibilityAnalysis(user1, user2, pair)
  const paywallFlag = posthog.getFeatureFlag('paywall2') ?? searchParams.get('stripe')

  return (
    <div className="flex-center w-full flex-col gap-8">
      <div className="flex w-full max-w-lg flex-col items-center justify-center gap-2 md:flex-row md:gap-8">
        <div className="w-1/2">
          <ProgressIndicator
            steps={user1Steps}
            result={user1Result}
            disableAnalysis={true}
            userUnlocked={user1.unlocked || false}
          />
        </div>
        <div className="w-1/2">
          <ProgressIndicator
            steps={user2Steps}
            result={user2Result}
            disableAnalysis={true}
            userUnlocked={user2.unlocked || false}
          />
        </div>
      </div>
      {!steps.compatibilityAnalysisCompleted && (
        <StepIndicator
          started={steps.compatibilityAnalysisStarted}
          completed={steps.compatibilityAnalysisCompleted}
          premium={!unlocked}
          text="Compatibility Analysis"
        />
      )}
      {!unlocked && <CompatibilityPriceButton price={paywallFlag as string} />}
      <ActionButtons
        shareActive={!!compatibilityResult?.about}
        text={`this is my and ${user2.username}'s Compatibility analysis by AI Agent, built on @wordware_ai`}
        url={`https://twitter.wordware.ai/${user1.username}/${user2.username}`}
      />
      <Compatibility
        names={[user1.name || user1.username, user2.name || user2.username]}
        pairAnalysis={compatibilityResult}
        unlocked={unlocked}
      />
      {/* <pre className="max-w-lg whitespace-pre-wrap">{JSON.stringify(compatibilityResult, null, 2)}</pre> */}
    </div>
  )
}

export default PairComponent
