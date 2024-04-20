// import { Button } from "frog"
// import { app } from "./route"
// import { DegenResponse } from "./types"
// import { mockDegenResponse } from "./mockDegenResponse"
// import { client } from "./client"
// import { mockItems } from "./mockFCUser"

// app.frame('/check', async (c) => {
//   const { buttonValue, buttonIndex, frameData, deriveState, verified } = c

//   const isDevEnvironment = process.env.CONFIG === 'DEV'

//   if (!verified) {
//     console.log(`Frame verification failed for ${frameData?.fid}`)
//     return c.res({
//       image: (
//         <div
//         style={{
//           fontFamily: 'Open Sans',
//           alignItems: 'center',
//           background: 'linear-gradient(to right, #231651, #17101F)',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'center',
//           textAlign: 'center',
//           width: '100%',
//         }}
//       >
//         <p style={{fontFamily: 'Open Sans', fontWeight: 700, fontSize: 45, color: '#D6FFF6'}}>Something went wrong</p>
//       </div>
//       ),
//       intents: [
//         <Button action="/">Restart</Button>,
//       ],
//     })
//   }

//   const state = deriveState(previousState => {
//     if (buttonIndex === 2 && buttonValue !== "check") previousState.count++
//     if (buttonIndex === 1 && buttonValue !== "check") previousState.count--
//   })

//   const fid = frameData?.fid || 0;

//   const request = !isDevEnvironment ? await fetch(
//     `https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'Content-Encoding': 'gzip'
//       },
//       next: {
//         revalidate: 3600, // 1 hour
//       },
//     }
//   ).catch((e) => {
//     console.error(`degen.tips: ${e}`)

//     throw new Error(`degen.tips: ${e}`)
//   }) : undefined

//   const json: DegenResponse[] = !isDevEnvironment ? await request.json()
//     .catch((e) => {
//       console.error(`degen.tips json: ${e}`)

//       throw new Error(`degen.tips json: ${e}`)
//     }) : mockDegenResponse

//   if (json.length === 0) {
//     return c.res({
//       image: (
//         <div
//         style={{
//           fontFamily: 'Open Sans',
//           alignItems: 'center',
//           background: 'linear-gradient(to right, #231651, #17101F)',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'center',
//           textAlign: 'center',
//           width: '100%',
//         }}
//       >
//         <h1 style={{fontFamily: 'DM Serif Display', fontSize: 70, color: '#D6FFF6'}}>Sorry, your FID: {fid} is not eligible for S3 DEGEN tipping</h1>
//         <p style={{fontSize: 45, color: '#D6FFF6'}}>Visit https://degen.tips for more info</p>
//       </div>
//       )
//     })
//   }

//   const allowance = json.find((value) => {
//     return value.tip_allowance
//   })?.tip_allowance || 0

//   const date = new Date()
//   const items = !isDevEnvironment ? await client(fid, date)
//   .catch((e) => {
//     console.error(`client items error: ${e}`)

//     throw new Error(`client items error: ${e}`)
//   }) : mockItems

//   const totalDegen = items.reduce((acc, item) => {
//     if (item) {
//       const amount = (item.degenValue?.match(/\d+/) ?? [0])[0] ?? 0;

//       return acc + Number(amount)
//     } else {
//       return acc + 0
//     }
//   }, 0);

//   const groupedArray = Array.from({ length: Math.ceil(items.length / 5) }, (_, index) =>
//     items.slice(index * 5, index * 5 + 5)
//   );

//   const page = `${state.count + 1}/${groupedArray.length}`

//   return c.res({
//     image: (
//       <div
//         style={{
//           fontFamily: 'Open Sans',
//           alignItems: 'center',
//           background: 'linear-gradient(to right, #231651, #17101F)',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'space-around'
//         }}
//       >
//         <h1 style={{flex: 1, fontFamily: 'DM Serif Display', fontSize: '3rem', color: '#D6FFF6'}}>🎩 Who did I tip today? 🎩</h1>

//         <p style={{color: 'white'}}>{page}</p>
//         {groupedArray.length > 0 &&
//           <div style={{ display: 'flex', flexDirection: 'column', width: '50%', backgroundColor: 'rgba(23, 16, 31, 0.75)', borderRadius: 25, borderWidth: 2, borderColor: '#ffffff' }}>
//             {groupedArray[state.count].map((u, index) => (
//             <div style={{
//                 display: 'flex',
//                 flexDirection: 'row',
//                 padding: 4,
//                 paddingLeft: 8,
//                 paddingRight: 8,
//                 justifyContent: 'space-around',
//                 maxWidth: '100%'
//               }}>
//               <h2 key={index} style={{ fontFamily: "AvenirNext", color: '#D6FFF6', fontWeight: 400}}>
//                   {`${(5 * state.count) + index + 1}. @${u?.username}`}
//                 </h2>
//               <h2 key={index} style={{ fontFamily: "AvenirNext", color: '#D6FFF6', fontWeight: 400}}>
//                 {`${u?.degenValue}`}
//               </h2>
//               <h2 key={index} style={{ fontFamily: "AvenirNext", color: '#D6FFF6', fontWeight: 400}}>
//                 {`at ${u?.timestamp} UTC`}
//               </h2>
//             </div>
//             ))}
//           </div>
//         }
//         {frameData !== undefined && groupedArray.length > 0 &&
//           <h1 style={{fontFamily: 'Open Sans', fontWeight: 700, fontSize: 25, color: '#2CFA1F'}}>TOTAL: {`${totalDegen}`}/{allowance} $DEGEN - REMAINING: {`${Number(allowance) - totalDegen}`}</h1>
//         }
//         {frameData !== undefined && groupedArray.length === 0 &&
//           <div style={{display: 'flex', flexDirection: 'column', flex: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}>
//             <h2 style={{ color: '#D6FFF6', fontWeight: 400 }}>You haven't tipped today</h2>
//             <h2 style={{ color: '#D6FFF6', fontWeight: 400 }}>Tips on casts in the following channels</h2>
//             <h2 style={{ color: '#D6FFF6', fontWeight: 400, marginTop: -16 }}>receive a 1.5x boost: </h2>
//             <h2 style={{ color: 'rgba(135, 206, 235, 1)', fontWeight: 700 }}>/farcastHER, /FarCon, /frames, /Base</h2>
//             <h2 style={{ color: 'rgba(135, 206, 235, 1)', fontWeight: 700, marginTop: -16 }}>/Dev, /Design, /Frontend, /Founders</h2>
//             <h2 style={{ color: 'rgba(135, 206, 235, 1)', fontWeight: 700, marginTop: -16 }}>/perl, /Product, and /Zora</h2>
//             <p style={{fontFamily: 'Open Sans', fontWeight: 700, fontSize: 25, color: '#2CFA1F'}}>Your allowance: {`${Number(allowance)}`}</p>
//           </div>
//         }
//       </div>
//     ),
//     intents: [
//       <Button action='/check' value="check">Refresh</Button>,
//       (state.count + 1 === groupedArray.length) && <Button.Link href="https://degen.tips">Visit degen.tips</Button.Link>,
//       <Button.Link href="https://warpcast.com/leovido.eth/0xd6e20741">Tip 🎩</Button.Link>,
//       (state.count > 0 && groupedArray.length > 1) && <Button value="dec">←</Button>,
//       (true) && <Button value="inc">→</Button>,
//     ],
//   })
// })
