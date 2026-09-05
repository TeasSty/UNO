/**
 * Guard: malformed location.hash must not throw (blank-page crash).
 * Run: node scripts/test-hash-decode.mjs
 */
import { decodeLocationHash } from '../src/scrollReset.js'

const cases = [
  ['', ''],
  ['#', ''],
  ['#top', 'top'],
  ['#contacts', 'contacts'],
  ['#%', '%'],
  ['#%E0', '%E0'],
  ['#%2Fservices', '/services'],
]

let failed = 0
for (const [input, expected] of cases) {
  let got
  try {
    got = decodeLocationHash(input)
  } catch (err) {
    console.error(`FAIL ${JSON.stringify(input)} threw ${err}`)
    failed += 1
    continue
  }
  if (got !== expected) {
    console.error(`FAIL ${JSON.stringify(input)} => ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`)
    failed += 1
  } else {
    console.log(`PASS ${JSON.stringify(input)} => ${JSON.stringify(got)}`)
  }
}

if (failed) {
  process.exit(1)
}
console.log(`ok (${cases.length})`)
