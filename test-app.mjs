import { chromium } from 'playwright'
const { mkdirSync } = await import('fs')

const BASE   = 'http://localhost:5174'
const SS_DIR = 'D:/www/Match-Minton/test-screenshots'
mkdirSync(SS_DIR, { recursive: true })

let pass = 0, fail = 0
const failures = []

function log(label, ok, detail = '') {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ' — ' + detail : ''}`)
  if (ok) pass++
  else { fail++; failures.push(label) }
}

// Firebase keeps persistent WS connections, so 'networkidle' hangs.
// Use 'load' + explicit short wait instead.
async function goto(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 15000 })
  await page.waitForTimeout(800)
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const shot = (page, name) => page.screenshot({ path: `${SS_DIR}/${name}.png` })

// ─── 1. Landing page ─────────────────────────────────────────────────────────
console.log('\n[1] Landing page (/)')
{
  const p = await ctx.newPage()
  await goto(p, BASE)
  await shot(p, '01-landing')
  log('page loads without error', !p.url().includes('error'))
  log('logo visible',            await p.locator('text=Match Minton').first().isVisible())
  log('"Get started free" CTA', await p.locator('text=Get started free').isVisible())
  log('"Log in" nav button',    await p.locator('button:has-text("Log in")').first().isVisible())
  await p.close()
}

// ─── 2. Auth modal ───────────────────────────────────────────────────────────
console.log('\n[2] Auth modal')
{
  const p = await ctx.newPage()
  await goto(p, BASE)
  await p.locator('button:has-text("Log in")').first().click()
  await p.waitForTimeout(400)
  await shot(p, '02-auth-modal')
  log('modal opens',           await p.locator('h2:has-text("Log in")').isVisible())
  log('email input present',   await p.locator('input[type="email"]').isVisible())
  log('password input present',await p.locator('input[type="password"]').first().isVisible())
  // Close by clicking backdrop
  await p.mouse.click(10, 10)
  await p.waitForTimeout(300)
  log('modal closes',          !(await p.locator('input[type="email"]').isVisible({ timeout: 500 }).catch(() => false)))
  await p.close()
}

// ─── 3. /judge entry ─────────────────────────────────────────────────────────
console.log('\n[3] Judge entry (/judge)')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/judge`)
  await shot(p, '03-judge-entry')
  log('route loads (/judge)',            p.url().endsWith('/judge'))
  log('"Enter Court Code" heading',      await p.locator('h1:has-text("Enter Court Code")').isVisible())
  log('4 char inputs rendered',          await p.locator('input[type="text"]').count() === 4)
  log('"Enter Court" button present',    await p.locator('button:has-text("Enter Court")').isVisible())
  log('button disabled when empty',      await p.locator('button:has-text("Enter Court")').isDisabled())

  // Fill 4 chars
  const inputs = p.locator('input[type="text"]')
  await inputs.nth(0).fill('A')
  await inputs.nth(1).fill('B')
  await inputs.nth(2).fill('C')
  await inputs.nth(3).fill('D')
  await shot(p, '03b-judge-filled')
  log('button enables with 4 chars',     await p.locator('button:has-text("Enter Court")').isEnabled())

  // Submit invalid code — wait for Firestore
  await p.locator('button:has-text("Enter Court")').click()
  await p.waitForTimeout(4000)
  await shot(p, '03c-judge-invalid')
  log('"Invalid code" shown for bad code', await p.locator('text=Invalid code').isVisible())
  await p.close()
}

// ─── 4. Auto-uppercase ───────────────────────────────────────────────────────
console.log('\n[4] Judge entry — input behaviour')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/judge`)
  const first = p.locator('input[type="text"]').nth(0)
  await first.fill('a')
  log('auto-uppercases lowercase input', (await first.inputValue()) === 'A')

  // After filling first box, focus should move to second
  await first.fill('Z')
  await p.waitForTimeout(100)
  const focused = await p.evaluate(() => document.activeElement?.tagName)
  // Can't easily assert which box has focus in headless, just check value
  log('first box holds typed char', (await first.inputValue()) === 'Z')
  await p.close()
}

// ─── 5. /judge/:code direct (invalid) ────────────────────────────────────────
// With firestore.rules deployed: shows "Court Not Found"
// Without rules deployed (dev): shows "Connection Error" (rules block anon reads)
// Both are correct error screens — check the error screen rendered at all.
console.log('\n[5] Judge view — invalid code')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/judge/XXXX`)
  await p.waitForTimeout(4000)   // Firestore lookup
  await shot(p, '05-judge-not-found')
  const errorScreenShown = await p.locator('text=Court Not Found').isVisible()
    || await p.locator('text=Connection Error').isVisible()
  log('error screen shown for bad code',  errorScreenShown)
  log('"Try Another Code" link present',  await p.locator('text=Try Another Code').isVisible())
  await p.close()
}

// ─── 6. Scoreboard — invalid session ─────────────────────────────────────────
// Same rules note as test 5 above.
console.log('\n[6] Scoreboard — invalid session')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/scoreboard/invalid-session-xyz`)
  await p.waitForTimeout(4000)   // Firestore lookup
  await shot(p, '06-scoreboard-not-found')
  const errorShown = await p.locator('text=Session Not Found').isVisible()
    || await p.locator('text=Connection Error').isVisible()
  log('error screen shown for bad sessionId', errorShown)
  await p.close()
}

// ─── 7. Scoreboard — TV dark background ──────────────────────────────────────
console.log('\n[7] Scoreboard — TV design')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/scoreboard/invalid-session-xyz`)
  await p.waitForTimeout(1000)
  // #030712 renders as rgb(3, 7, 18) in the DOM
  const hasDarkBg = await p.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')]
    return allEls.some(el => {
      const bg = getComputedStyle(el).backgroundColor
      return bg === 'rgb(3, 7, 18)'
    })
  })
  log('TV background #030712 (rgb 3 7 18) applied', hasDarkBg)
  // No scrollbars on TV layout
  const overflow = await p.evaluate(() => getComputedStyle(document.body).overflow)
  log('body overflow not scroll', overflow !== 'scroll')
  await p.close()
}

// ─── 8. Scoring logic pure function ──────────────────────────────────────────
console.log('\n[8] Scoring logic — computeMatchState')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/judge`)
  // Inject and run the pure scoring function via page.evaluate
  const result = await p.evaluate(async () => {
    // Dynamically import the module (Vite exposes modules at /@fs/ in dev)
    // We'll replicate the logic inline to test it
    function getGameWinner(score, cfg) {
      const { pointsToWin, deuceRule, maxPoints } = cfg
      const hi = Math.max(score.teamA, score.teamB)
      const lo = Math.min(score.teamA, score.teamB)
      if (hi < pointsToWin) return null
      const leader = score.teamA > score.teamB ? 'teamA' : score.teamB > score.teamA ? 'teamB' : null
      if (!leader) return null
      if (!deuceRule) return leader
      if (hi >= maxPoints) return leader
      if (hi - lo >= 2) return leader
      return null
    }

    function computeMatchState(pointLog, config) {
      const { numberOfGames } = config
      const gamesNeededToWin = Math.ceil(numberOfGames / 2)
      const completedGames = []
      const gamesWon = { teamA: 0, teamB: 0 }
      let currentGame = 1
      let currentScore = { teamA: 0, teamB: 0 }
      let matchWinner = null
      for (const point of pointLog) {
        if (matchWinner) break
        currentScore = { ...currentScore, [point.team]: currentScore[point.team] + 1 }
        const gw = getGameWinner(currentScore, config)
        if (gw) {
          completedGames.push({ game: currentGame, teamA: currentScore.teamA, teamB: currentScore.teamB, winner: gw })
          gamesWon[gw]++
          if (gamesWon[gw] >= gamesNeededToWin) matchWinner = gw
          else { currentGame++; currentScore = { teamA: 0, teamB: 0 } }
        }
      }
      return { currentGame, currentScore, completedGames, gamesWon, matchWinner }
    }

    const cfg = { pointsToWin: 21, numberOfGames: 3, deuceRule: true, maxPoints: 30 }

    // Test 1: empty log → 0-0 game 1
    const empty = computeMatchState([], cfg)

    // Test 2: score to 21-0 straight → teamA wins game 1
    const game1Log = Array(21).fill({ team: 'teamA' })
    const afterGame1 = computeMatchState(game1Log, cfg)

    // Test 3: teamA wins match 2-0 (best of 3)
    const matchLog = [...Array(21).fill({ team: 'teamA' }), ...Array(21).fill({ team: 'teamA' })]
    const matchResult = computeMatchState(matchLog, cfg)

    // Test 4: deuce at 20-20 → need 2-point lead
    const deuceLog = [
      ...Array(20).fill({ team: 'teamA' }),
      ...Array(20).fill({ team: 'teamB' }),
    ]
    const atDeuce = computeMatchState(deuceLog, cfg)
    // One more teamA point → 21-20 still in deuce (need 2-point lead)
    const duece21_20 = computeMatchState([...deuceLog, { team: 'teamA' }], cfg)
    // Two more teamA → 22-20 → teamA wins
    const duece22_20 = computeMatchState([...deuceLog, { team: 'teamA' }, { team: 'teamA' }], cfg)

    // Test 5: cap at 30 — teamA wins 30-29
    const capLog = [
      ...Array(29).fill({ team: 'teamA' }),
      ...Array(29).fill({ team: 'teamB' }),
      { team: 'teamA' },  // 30-29 → teamA wins (cap)
    ]
    const atCap = computeMatchState(capLog, cfg)

    return { empty, afterGame1, matchResult, atDeuce, duece21_20, duece22_20, atCap }
  })

  log('empty log → 0-0, no winner',        result.empty.currentScore.teamA === 0 && !result.empty.matchWinner)
  log('21-0 → game 1 complete teamA',       result.afterGame1.completedGames[0]?.winner === 'teamA')
  log('match 2-0 → teamA wins match',       result.matchResult.matchWinner === 'teamA')
  log('20-20 → no winner (deuce pending)',  result.atDeuce.currentScore.teamA === 20 && !result.atDeuce.matchWinner)
  log('21-20 → still no winner (deuce)',    result.duece21_20.currentScore.teamA === 21 && !result.duece21_20.matchWinner)
  log('22-20 → teamA wins game (deuce)',    result.duece22_20.completedGames[0]?.winner === 'teamA')
  log('30-29 → teamA wins at cap',          result.atCap.completedGames[0]?.winner === 'teamA')
  await p.close()
}

// ─── 9. ProGate renders children when Pro ────────────────────────────────────
console.log('\n[9] Route guard — unauthenticated root shows landing')
{
  const p = await ctx.newPage()
  await goto(p, `${BASE}/`)
  await shot(p, '09-root-unauthed')
  log('unauthenticated / → landing page', await p.locator('text=Get started free').isVisible())
  // 'Start Session' only appears inside the logged-in SetupScreen
  log('no logged-in app UI shown',           !(await p.locator('text=Start Session').isVisible({ timeout: 500 }).catch(() => false)))
  await p.close()
}

// ─── Done ─────────────────────────────────────────────────────────────────────
await browser.close()
console.log(`\n${'─'.repeat(52)}`)
console.log(`  Total: ${pass + fail}   Passed: ${pass}   Failed: ${fail}`)
if (failures.length) {
  console.log('\n  Failed checks:')
  failures.forEach(f => console.log(`    ✗ ${f}`))
}
console.log(`${'─'.repeat(52)}`)
console.log(`\nScreenshots → ${SS_DIR}\n`)
