<script setup lang="ts">
useHead({
  title: 'Lot Calculator',
  meta: [
    { name: 'description', content: 'Calculate lot, pip and entry value based on account risk ratio and risk reward ratio.' },
    { name: 'theme-color', content: '#ffffff' },
    { name: 'author', content: 'madjaon@gmail.com' },
  ],
  link: [
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon-180x180.png',
      sizes: '180x180',
    },
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
  ]
  // bodyAttrs: {
  //   class: 'test'
  // },
  // script: [ { innerHTML: 'console.log(\'Hello world\')' } ]
})

function naiveRound(num: number, decimalPlaces = 1) {
  var p = Math.pow(10, decimalPlaces)
  return Math.round(num * p) / p
}

const config = ref(false)
const clock = ref(false)
const pipvalue = ref(10)
const buysell = ref(false)
const slpip = ref(10)
const tppip = ref(20)
const riskRatio = ref(1)
const lockBalance = ref(false)
const balanceBase = ref(5000)
const balance = ref(balanceBase.value)
const rr = computed(() => slpip.value ? tppip.value / slpip.value : 0)
const slvalue = computed(() => rr.value ? balance.value * riskRatio.value / 100 : 0)
const tpvalue = computed(() => slvalue.value * rr.value)

// Lot Size = (Account Balance x Risk Percentage) / (Stop-Loss in Pips x Value per Pip)
const lot = computed(() => naiveRound((balance.value * riskRatio.value / 100) / (slpip.value * pipvalue.value), 2))

// LOG
const logs = ref<any>([])

watch(balanceBase, (v: any) => {
  balance.value = v
})

// Telegram Message
// Get chat id: https://api.telegram.org/bot<YourBOTToken>/getUpdates
// Get bot: https://api.telegram.org/bot<YourBOTToken>/getMe
// emoji: https://apps.timwhitlock.info/emoji/tables/unicode
async function telegramSendMessage(text: any) {
  const token = '7428823315:AAG_aJyhTaHfWkhLiiRcou0PN63kBSSG5bs'
  // const { data: result } = await useFetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=<ChatID>&parse_mode=MarkdownV2&text=${encodeURIComponent(text)}`)

  const data = await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    // body: {
    //   // My todo data
    // },
    query: {
      chat_id: '-1002184475490',
      parse_mode: 'MarkdownV2',
      text,
    }
  })

  // console.log(data)
}

function onLogAdd(checked = false) {
  const item = {
    balance: balance.value,
    riskratio: riskRatio.value,
    lot: lot.value,
    slpip: slpip.value,
    slvalue: slvalue.value,
    tppip: tppip.value,
    tpvalue: tpvalue.value,
    buysell: buysell.value,
    checked,
  }

  logs.value = [
    ...logs.value,
    ...[item],
  ]

  onRate()
}

function onLogRemove(index: any) {
  if (index > -1)
    logs.value = [...logs.value.slice(0, index), ...logs.value.slice(index + 1)]

  onRate()
}

function onLogRemoveAll() {
  logs.value = []

  onRate()
}

// function onLogCheck(index: any) {
//   if (index > -1)
//     logs.value[index].checked = !logs.value[index].checked

//   onRate()
// }

// Winrate
const winrate = ref(0)
const winEntries = ref(0)
const winValue = ref(0)
const winPip = ref(0)
const lossrate = computed(() => logs.value?.length ? 100 - winrate.value : 0)
const lossEntries = computed(() => logs.value?.length ? logs.value?.length - winEntries.value : 0)
const lossValue = ref(0)
const lossPip = ref(0)
const resultPip = ref(0)
const resultValue = ref(0)

async function onRate() {
  const checkedItem = logs.value.filter((x: any) => x?.checked)
  const uncheckedItem = logs.value.filter((x: any) => !x?.checked)

  winEntries.value = checkedItem?.length

  winrate.value = logs.value?.length && winEntries.value
    ? naiveRound(winEntries.value / logs.value?.length * 100, 0)
    : 0

  winValue.value = winEntries.value && winrate.value
    ? checkedItem?.reduce(
        (a: any, c: any) => a + c?.tpvalue,
        0,
      )
    : 0

  winPip.value = winEntries.value && winrate.value
    ? checkedItem?.reduce(
        (a: any, c: any) => a + c?.tppip,
        0,
      )
    : 0

  lossValue.value = lossEntries.value && lossrate.value
    ? uncheckedItem?.reduce(
        (a: any, c: any) => a + c?.slvalue,
        0,
      )
    : 0

  lossPip.value = lossEntries.value && lossrate.value
    ? uncheckedItem?.reduce(
        (a: any, c: any) => a + c?.slpip,
        0,
      )
    : 0

  resultPip.value = winPip.value - lossPip.value
  resultValue.value = winValue.value - lossValue.value

  if (!lockBalance.value)
    balance.value = logs.value?.length ? naiveRound(balanceBase.value + resultValue.value) : balanceBase.value
}

function onSendResult() {
  let text = `🔥 *Entries log* 🔥`

  text += `\n🚩 *Winrate*: ${winrate.value}%`
  text += `\n🍭 *Win*: ${winEntries.value} entries. ${winPip.value} pip. $${naiveRound(winValue.value)}`
  text += `\n💩 *Loss*: ${lossEntries.value} entries. ${lossPip.value} pip. $${naiveRound(lossValue.value)}`
  text += `\n✨ *Total*: ${logs.value?.length} entries. ${resultPip.value} pip. $${naiveRound(resultValue.value)}`

  // text += `\n[Lot Calculator](https://lotpip.netlify.app/)`

  text = text.replace(/\./g,'\\.')
  text = text.replace(/\-/g,'\\-')

  telegramSendMessage(text)
}
</script>

<template>
  <NuxtPwaManifest />

  <div class="container antialiased text-gray-900 px-6">
    <div class="max-w-xl mx-auto py-12 divide-y md:max-w-4xl">
      <AppHeader />

      <div class="py-12 text-xl print:hidden">
        <div class="md:flex">
          <div class="md:shrink-0 md:w-[60%]">
            <h2 class="text-4xl font-bold">{{ lot }}</h2>
            <p class="mt-2 text-gray-600">{{ lot }} LOT; 1/{{ naiveRound(rr) }} RR; Balance: <span class="font-bold">${{ naiveRound(balance) }}</span></p>

            <div class="mt-8 w-full">
              <div class="grid grid-cols-2 gap-6">
                <label class="block">
                  <span class="text-gray-700">SL pips</span>
                  <input v-model="slpip" type="number" name="slpip" min="0" step="1" class="mt-1 block w-full" placeholder="SL pip" />
                  <span v-if="slvalue" class="text-red-700 block font-bold px-3">${{ naiveRound(slvalue) }}</span>
                </label>
                <label class="block">
                  <span class="text-gray-700">TP pips</span>
                  <input v-model="tppip" type="number" name="tppip" min="0" step="1" class="mt-1 block w-full" placeholder="TP pip" />
                  <span v-if="tpvalue" class="text-green-700 block font-bold px-3">${{ naiveRound(tpvalue) }}</span>
                </label>
              </div>
            </div>

            <div v-if="config" class="mt-8 w-full">
              <div class="grid grid-cols-2 gap-6 mb-5">
                <label class="block">
                  <span class="text-gray-700">Risk (%)</span>
                  <input v-model="riskRatio" type="number" name="riskRatio" min="0" step="0.05" class="mt-1 block w-full" placeholder="Risk (%)" />
                </label>
                <label class="block">
                  <span class="text-gray-700">Balance base ($)</span>
                  <input v-model="balanceBase" type="number" name="balanceBase" min="0" step="10" class="mt-1 block w-full" placeholder="Balance base ($)" />
                </label>
              </div>
              <div class="grid grid-cols-2 gap-6 mb-5">
                <label class="block">
                  <span class="text-gray-700">1 pip value ($)</span>
                  <input v-model="pipvalue" type="number" name="pipvalue" class="mt-1 block w-full" placeholder="Pip value" />
                </label>
                <div class="w-full mt-10">
                  <label class="inline-flex items-center cursor-pointer">
                    <input v-model="lockBalance" type="checkbox" :disabled="logs?.length > 0" value="" class="sr-only peer">
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span class="ms-3 text-sm font-medium text-gray-900">Lock balance</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mt-8">
              <div class="gap-x-5 mt-2">
                <button class="mx-2 text-base" @click="config = !config">Config</button>
                <button class="mx-2 text-base" @click="clock = !clock">Clock</button>
              </div>
              <label class="mt-2 inline-flex items-center cursor-pointer">
                <span class="ms-3 text-base font-medium text-gray-900">&#8593; Buy</span>
                <input v-model="buysell" type="checkbox" value="" class="sr-only peer">
                <div class="relative w-11 h-6 ml-3 bg-green-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-400"></div>
                <span class="ms-3 text-base font-medium text-gray-900">&#8595; Sell</span>
              </label>
            </div>
            <div class="grid grid-cols-2 gap-6 mt-8">
              <button class="mx-2 px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-400 rounded-none shadow-sm" @click="onLogAdd()">Loss</button>
              <button class="mx-2 px-4 py-2 font-semibold text-white bg-green-500 hover:bg-green-400 rounded-none shadow-sm" @click="onLogAdd(1)">Win</button>
            </div>
          </div>

          <div v-if="clock" class="flex justify-center w-full">
            <DigitalClock />
          </div>
        </div>
      </div>

      <div v-if="logs?.length" class="py-8">
        <div class="flex item-centers justify-between">
          <h1 class="text-4xl font-bold">Entry Log</h1>
          <button class="mt-2 px-4 py-2 font-semibold print:hidden" @click="onSendResult()">Send Result</button>
        </div>

        <div class="bg-white py-2 mt-5">
          <div class="mx-auto">
            <dl class="grid grid-cols-3 gap-x-8 gap-y-16 text-center text-xl">
              <div class="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt class="leading-7 text-gray-600 text-base md:text-xl">No. Entries</dt>
                <dd class="order-first text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{{ logs?.length }}</dd>
                <dt class="text-gray-600">
                  {{ resultPip }}pip; ${{ naiveRound(resultValue) }};
                </dt>
              </div>
              <div class="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt class="leading-7 text-base md:text-xl text-red-500">{{ lossEntries }} Loss</dt>
                <dd class="order-first text-4xl font-semibold tracking-tight text-red-500 sm:text-5xl">{{ logs?.length ? lossrate : 0 }}%</dd>
                <dt class="text-gray-600">{{ lossPip }}pip; ${{ naiveRound(lossValue) }};</dt>
              </div>
              <div class="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt class="leading-7 text-base md:text-xl text-green-500">{{ winEntries }} Win</dt>
                <dd class="order-first text-4xl font-semibold tracking-tight text-green-500 sm:text-5xl">{{ logs?.length ? winrate : 0 }}%</dd>
                <dt class="text-gray-600">{{ winPip }}pip; ${{ naiveRound(winValue) }};</dt>
              </div>
            </dl>
          </div>
        </div>

        <div class="mt-8">
          <table class="border-collapse w-full border border-slate-400 bg-white text-base shadow-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="w-1/8 print:w-1/12 border border-slate-300 font-semibold p-1 text-slate-900 text-center">#</th>
                <th class="w-3/8 print:w-6/12 border border-slate-300 font-semibold p-1 px-2 text-slate-900 text-left">Entry</th>
                <th class="w-2/8 print:w-4/12 border border-slate-300 font-semibold p-1 text-center">SL/TP</th>
                <!-- <th class="w-1/8 print:w-1/12 border border-slate-300 font-semibold p-1 text-slate-900 text-center">W/L</th> -->
                <th class="w-1/8 border border-slate-300 font-semibold p-1 text-slate-900 text-center print:hidden">
                  <button class="text-red-500" @click="onLogRemoveAll">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0,0,300,150">
                      <g fill="#b91c1c" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in logs"
                :key="`log${index}`"
              >
                <td class="border border-slate-300 p-1 text-slate-500 text-center">{{ index + 1 }}</td>
                <td class="border border-slate-300 p-1 text-slate-500 px-2 text-left text-sm">
                  {{ `${item?.checked ? 'Win' : 'Loss'}; $${item?.balance}; ${item?.riskratio}%; ${item?.lot}lot; ${!!item?.buysell ? '&#8595; Sell' : '&#8593; Buy'}; SL: ${item?.slpip} pip; TP: ${item?.tppip} pip;` }}
                </td>
                <td
                  class="border border-slate-300 p-1 text-center"
                  :class="`${item?.checked ? 'text-green-500' : 'text-red-500'}`"
                >{{ item?.checked ? `+$${naiveRound(item?.tpvalue)}` : `-$${naiveRound(item?.slvalue)}` }}</td>
                <!-- <td class="border border-slate-300 p-1 text-slate-500 text-center">
                  <input :id="`wRhFJS${index}`" type="checkbox" :checked="item?.checked" class="print:hidden" @click="onLogCheck(index)" />
                  <span class="hidden print:block">
                    {{ item?.checked ? 'x' : '' }}
                  </span>
                </td> -->
                <td class="border border-slate-300 p-1 text-slate-500 text-center print:hidden">
                  <button class="text-red-500" @click="onLogRemove(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0,0,300,150">
                      <g fill="#b91c1c" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AppRefresh />

      <div class="flex justify-center w-full mt-10 py-10 text-base text-gray-600">
        @stoi99
      </div>
    </div>
  </div>
</template>
