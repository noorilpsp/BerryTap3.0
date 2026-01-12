export function getABTestData(campaignId: string) {
  // Return null for campaigns without A/B tests
  if (campaignId === "new") {
    return null
  }

  // Return running test for specific campaign IDs
  if (campaignId === "test-running") {
    return {
      status: "running",
      testType: "subject_line",
      variants: {
        a: {
          subject: "Welcome! Here's 20% off your first visit",
          sent: 120,
          delivered: 118,
          opens: 45,
          openRate: 38.1,
          clicks: 12,
          clickRate: 10.2,
          conversions: 3,
          conversionRate: 2.5,
          revenue: 287,
        },
        b: {
          subject: "🎉 Welcome bonus: 20% off just for you!",
          sent: 120,
          delivered: 119,
          opens: 58,
          openRate: 48.7,
          clicks: 18,
          clickRate: 15.1,
          conversions: 7,
          conversionRate: 5.9,
          revenue: 645,
        },
      },
      configuration: {
        sampleSize: 20,
        winningMetric: "open_rate",
        testDuration: 4,
        winnerSelection: "automatic",
        confidence: 95,
      },
      currentConfidence: 89.3,
      projectedWinner: "b",
      projectedConfidence: 87,
    }
  }

  // Return completed test
  if (campaignId === "test-complete") {
    return {
      status: "complete",
      testType: "subject_line",
      variants: {
        a: {
          subject: "Welcome! Here's 20% off your first visit",
          sent: 120,
          delivered: 118,
          opens: 45,
          openRate: 38.1,
          clicks: 12,
          clickRate: 10.2,
          conversions: 3,
          conversionRate: 2.5,
          revenue: 287,
        },
        b: {
          subject: "🎉 Welcome bonus: 20% off just for you!",
          sent: 120,
          delivered: 119,
          opens: 58,
          openRate: 48.7,
          clicks: 18,
          clickRate: 15.1,
          conversions: 7,
          conversionRate: 5.9,
          revenue: 645,
        },
      },
      winner: "b",
      confidence: 96.2,
      completedAt: "2024-11-22T14:12:00Z",
    }
  }

  // Default: no A/B test configured
  return null
}
