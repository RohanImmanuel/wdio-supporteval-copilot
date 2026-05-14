import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import { path as chromedriverPath } from 'chromedriver'

const CHROMEDRIVER_PORT = 9515
let chromedriverProcess: ChildProcess | undefined

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./src/crawl.e2e.ts'],
  maxInstances: 1,

  hostname: 'localhost',
  port: CHROMEDRIVER_PORT,
  path: '/',

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--headless=new',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1280,900',
        ],
      },
    },
  ],

  logLevel: 'warn',
  baseUrl: 'https://webdriver.io',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 900000,
  },

  async onPrepare() {
    chromedriverProcess = spawn(chromedriverPath, [`--port=${CHROMEDRIVER_PORT}`], {
      stdio: 'ignore',
    })
    // Give chromedriver a moment to bind the port before WDIO tries to connect
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  onComplete() {
    chromedriverProcess?.kill()
  },
}
