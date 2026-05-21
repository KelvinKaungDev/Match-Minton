export const strings = {
  th: {
    loading: 'กำลังโหลด...',

    // Setup
    startReady: (n) => `เริ่มเล่น — พร้อม ${n} คน`,
    needPlayers: (n) => `ต้องการผู้เล่นในแถว ≥4 คน (${n}/4)`,

    // SessionConfig
    sessionConfig: 'ตั้งค่าเซสชัน',
    courts: 'คอร์ท',
    courtNames: 'หมายเลขคอร์ท',
    maxRounds: 'รอบสูงสุด / คน',
    maxPlayers: 'จำนวนผู้เล่นสูงสุด',
    playersPerMatch: 'ผู้เล่นต่อรอบ',
    fullRoundPrice: 'ราคาเต็มรอบ',
    pricePerRound: (n) => `${n} / รอบ`,

    // PlayerList
    playerCount: (n, max) => `ผู้เล่น (${n}/${max})`,
    benchWaiting: (b, w) => `${b} แถว · ${w} รอเข้า`,
    allArrived: 'มาครบแล้ว',
    noPlayers: 'ยังไม่มีผู้เล่น',
    bench: 'แถว',
    waiting: 'รอเข้า',

    // AddPlayer
    addPlayers: 'เพิ่มผู้เล่น',
    single: 'ทีละคน',
    bulk: 'หลายคน',
    playerName: 'ชื่อผู้เล่น',
    duplicateName: 'ชื่อนี้มีอยู่แล้ว',
    maxReached: (n) => `ครบ ${n} คนแล้ว`,
    addPlayer: 'เพิ่มผู้เล่น',
    importCount: (n) => `นำเข้า ${n} คน`,
    importBtn: 'นำเข้า',
    bulkPlaceholder: 'วางรายชื่อจาก Line/Chat ได้เลย เช่น:\n1. ชิ (CF)\n2. พี่ยู (CF)\n3. Hong (เพื่อนแทน) (CF)\n...\nระบบจะดึงชื่อให้อัตโนมัติ',
    bulkNoNames: 'ไม่พบรายชื่อ — ลองวางข้อความที่มีเลข เช่น "1. ชื่อ"',
    bulkFound: (n) => `พบ ${n} คน — แก้ชื่อได้ก่อน Import`,
    clearAll: 'ล้างทั้งหมด',

    // Session tabs
    tabCourts: 'คอร์ท',
    tabBench: 'แถว',
    tabWaiting: 'รอเข้า',
    tabDone: 'เสร็จ',
    tabHistory: 'ประวัติ',
    endSession: 'จบเซสชัน',

    // SessionHeader
    playing: (n) => `${n} กำลังเล่น`,
    benchCount: (n) => `${n} แถว`,
    waitingCount: (n) => `${n} รอเข้า`,
    doneCount: (n) => `${n} เสร็จ`,

    // BenchTab
    onBench: (n) => `${n} คนในแถว`,
    emptyCourts: (n, m) => `${n} คอร์ทว่าง · เปิดได้ ${m} คอร์ท`,
    matchNow: 'จับคู่เลย',
    walkIn: '+ วอล์คอิน',
    walkInTitle: 'วอล์คอิน',
    cancel: 'ยกเลิก',
    sessionFull: (n) => `เต็มแล้ว (${n} คน)`,
    addToBench: 'เพิ่มเข้าแถว',
    noBench: 'ไม่มีคนในแถว',
    leave: 'ออก',

    // Price prompt
    setPriceTitle: 'ตั้งราคาก่อนเริ่ม?',
    setPriceDesc: 'ยังไม่ได้ตั้งราคาค่าคอร์ท — ตั้งตอนนี้หรือข้ามไปก็ได้',
    skipPrice: 'ข้าม',
    setAndStart: 'ตั้งราคา & เริ่ม',

    // Config validation
    configErrorTitle: 'กรุณาตั้งค่าก่อน',
    errorNoCourts: 'จำนวนคอร์ทต้องมากกว่า 0',
    errorNoRounds: 'จำนวนรอบสูงสุดต้องมากกว่า 0',
    errorNoMaxPlayers: 'จำนวนผู้เล่นสูงสุดต้องมากกว่า 0',
    errorNoPrice: 'ยังไม่ได้ตั้งราคาค่าคอร์ท (FullRound Price)',

    // WaitingTab
    noWaiting: 'ไม่มีคนรอเข้า',
    arrived: 'มาแล้ว',

    // CourtsTab
    noCourts: 'ไม่มีคอร์ทที่กำลังเล่น',
    history: 'ประวัติ',
    noHistory: 'ยังไม่มีประวัติแมตช์',
    matchNo: (n) => `แมตช์ที่ ${n}`,
    courtNo: (n) => `คอร์ท ${n}`,
    teamA: 'ทีม A',
    teamB: 'ทีม B',

    // CourtCard
    courtLabel: (n) => `คอร์ท ${n}`,
    courtEmpty: 'คอร์ทว่าง',
    startMatch: 'เริ่มแมตช์',
    need4: 'ต้องการ 4+ คนในแถว',
    courtDone: 'จบคอร์ท',
    rounds: (n) => `${n} รอบ`,
    swap: 'สลับ',
    swapWith: (name) => `สลับ ${name} กับ:`,
    cancelSwap: 'ยกเลิก',
    noBenchForSwap: 'ไม่มีคนในแถว',

    // DoneTab
    noDone: 'ยังไม่มีคนเสร็จ',
    playMore: 'เล่นอีก',
    leftEarly: 'ออกก่อน',

    // Summary
    sessionSummary: 'สรุปเซสชัน',
    roundsPlayed: 'รอบที่เล่น',
    totalPlayers: 'ผู้เล่นทั้งหมด',
    avgRounds: 'เฉลี่ยต่อคน',
    mvpLabel: (n) => `MVP (${n} รอบ)`,
    allPlayers: 'ผู้เล่นทั้งหมด',
    newSession: 'เซสชันใหม่',
    payment: 'ค่าคอร์ท',
    totalCollect: 'รวม',
  },

  en: {
    loading: 'Loading...',

    // Setup
    startReady: (n) => `Start — ${n} ready`,
    needPlayers: (n) => `Need ≥4 bench players (${n}/4)`,

    // SessionConfig
    sessionConfig: 'Session Config',
    courts: 'Courts',
    courtNames: 'Court Numbers',
    maxRounds: 'Max Rounds / Player',
    maxPlayers: 'Max Players',
    playersPerMatch: 'Players per match',
    fullRoundPrice: 'Full Round Price',
    pricePerRound: (n) => `${n} / round`,

    // PlayerList
    playerCount: (n, max) => `Players (${n}/${max})`,
    benchWaiting: (b, w) => `${b} bench · ${w} waiting`,
    allArrived: 'All Arrived',
    noPlayers: 'No players yet',
    bench: 'Bench',
    waiting: 'Waiting',

    // AddPlayer
    addPlayers: 'Add Players',
    single: 'Single',
    bulk: 'Bulk',
    playerName: 'Player name',
    duplicateName: 'Name already exists',
    maxReached: (n) => `Maximum ${n} players reached`,
    addPlayer: 'Add Player',
    importCount: (n) => `Import ${n}`,
    importBtn: 'Import',
    bulkPlaceholder: 'Paste names from Line/Chat, e.g.:\n1. John\n2. Jane\n3. Bob\n...\nNames will be extracted automatically',
    bulkNoNames: 'No names found — try pasting text with numbers e.g. "1. Name"',
    bulkFound: (n) => `Found ${n} — edit before importing`,
    clearAll: 'Clear all',

    // Session tabs
    tabCourts: 'Courts',
    tabBench: 'Bench',
    tabWaiting: 'Waiting',
    tabDone: 'Done',
    tabHistory: 'History',
    endSession: 'End Session',

    // SessionHeader
    playing: (n) => `${n} playing`,
    benchCount: (n) => `${n} bench`,
    waitingCount: (n) => `${n} waiting`,
    doneCount: (n) => `${n} done`,

    // BenchTab
    onBench: (n) => `${n} on bench`,
    emptyCourts: (n, m) => `${n} empty court${n > 1 ? 's' : ''} · can fill ${m}`,
    matchNow: 'Match Now',
    walkIn: '+ Walk In',
    walkInTitle: 'Walk In',
    cancel: 'Cancel',
    sessionFull: (n) => `Session full (${n} players)`,
    addToBench: 'Add to Bench',
    noBench: 'No players on bench',
    leave: 'Leave',

    // Price prompt
    setPriceTitle: 'Set price before starting?',
    setPriceDesc: 'No court fee has been set — set one now or skip.',
    skipPrice: 'Skip',
    setAndStart: 'Set & Start',

    // Config validation
    configErrorTitle: 'Please fix the following',
    errorNoCourts: 'Courts must be greater than 0',
    errorNoRounds: 'Max rounds must be greater than 0',
    errorNoMaxPlayers: 'Max players must be greater than 0',
    errorNoPrice: 'Court fee (Full Round Price) is not set',

    // WaitingTab
    noWaiting: 'No waiting players',
    arrived: 'Arrived',

    // CourtsTab
    noCourts: 'No active courts',
    history: 'History',
    noHistory: 'No match history yet',
    matchNo: (n) => `Match ${n}`,
    courtNo: (n) => `Court ${n}`,
    teamA: 'TEAM A',
    teamB: 'TEAM B',

    // CourtCard
    courtLabel: (n) => `COURT ${n}`,
    courtEmpty: 'Court finished early',
    startMatch: 'Start New Match',
    need4: 'Need 4+ on Bench',
    courtDone: 'Court Done',
    rounds: (n) => `${n}r`,
    swap: 'Swap',
    swapWith: (name) => `Swap ${name} with:`,
    cancelSwap: 'Cancel',
    noBenchForSwap: 'No bench players',

    // DoneTab
    noDone: 'No done players',
    playMore: 'Play More',
    leftEarly: 'Left Early',

    // Summary
    sessionSummary: 'Session Summary',
    roundsPlayed: 'Rounds Played',
    totalPlayers: 'Total Players',
    avgRounds: 'Avg Rounds',
    mvpLabel: (n) => `MVP (${n}r)`,
    allPlayers: 'All Players',
    newSession: 'New Session',
    payment: 'Court Fee',
    totalCollect: 'total',
  },
}
