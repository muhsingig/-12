// Sample work for a hypothetical studio. Every name, place, figure and collaborator here is
// invented for the portfolio and should be swapped for real projects before any launch.
export const projects = [
  {
    id: 'midvinter',
    scene: 0,
    title: 'Midvinter',
    kind: 'Light tunnel',
    place: 'Kiruna',
    year: 2025,
    client: 'Kiruna winter programme',
    summary:
      'A 412-metre snow tunnel lit by 96 arches. The light warms from overcast daylight at the entrance to candlelight at the far end, so walking through takes you across a whole day in reverse.',
    body: [
      'Kiruna sees no sunrise between early December and early January. The brief asked for something people would walk to in that blue dark, not just photograph.',
      'Each arch is a ring of 72 pixels set into packed snow. The colour temperature steps down by 48 kelvin per arch, a change too small to see from one to the next and impossible to miss over the full length.',
      'The whole tunnel switches to 5% for twenty minutes whenever the aurora forecast passes a threshold, so the sky gets the room.'
    ],
    facts: [
      { value: 412, suffix: ' m', label: 'of tunnel, cut by hand' },
      { value: 96, label: 'arches of light' },
      { value: 31000, label: 'visitors in 19 nights', separator: ',' }
    ],
    credits: 'Snow build: Arctic Ice Works (sample). Engineering: Studio Solvik with Norrgrav El (sample).'
  },
  {
    id: 'tidvatten',
    scene: 1,
    title: 'Tidvatten',
    kind: 'Terminal façade',
    place: 'Gothenburg',
    year: 2024,
    client: 'Harbour ferry terminal',
    summary:
      'Two hundred and twenty vertical lines on a glass façade, each one set to the live water level of the harbour. All night the building draws the tide.',
    body: [
      'The terminal faces the water for 180 metres and used to be lit by floodlights that also lit the river. The new scheme puts every lumen on the glass and almost none on the water.',
      'A gauge at the quay reports once a minute. Each line holds the reading from a different minute of the last four hours, so the façade reads left to right as a slow wave.',
      'Spill on the water surface measures 0.3 lux, below the level that confuses the fish the harbour authority asked us to protect.'
    ],
    facts: [
      { value: 220, label: 'lines of light' },
      { value: 4, suffix: ' h', label: 'of tide on the glass' },
      { value: 0.3, suffix: ' lux', label: 'spill on the water', decimals: 1 }
    ],
    credits: 'Architecture: existing building. Control software: Studio Solvik.'
  },
  {
    id: 'en-soluppgang',
    scene: 2,
    title: 'En soluppgång',
    kind: 'Gallery room',
    place: 'Malmö',
    year: 2024,
    client: 'Kvarnen Gallery (sample)',
    summary:
      'One sunrise over the Öresund, measured on the spring equinox, replayed on a fourteen-metre wall in twelve minutes. Visitors sat on the bench and watched it come up again and again.',
    body: [
      'We measured the sky from a jetty at 05:10 on 20 March with a spectrometer, a reading every four seconds for forty-eight minutes.',
      'The wall is lit from a hidden trough by 1,400 tunable diodes. The recording is compressed four times and played without a loop seam: the end of the sunrise is the start of the next dark.',
      'The room stayed open until midnight so the sunrise could be seen at the hour no one sees one.'
    ],
    facts: [
      { value: 14, suffix: ' m', label: 'of wall' },
      { value: 12, suffix: ' min', label: 'per sunrise' },
      { value: 1400, label: 'tunable diodes', separator: ',' }
    ],
    credits: 'Measurement: Studio Solvik. Bench: made by the gallery’s own workshop.'
  },
  {
    id: 'low-tide',
    scene: 3,
    title: 'Low Tide',
    kind: 'Tour lighting',
    place: '38 shows',
    year: 2023,
    client: 'Hollow Coast (sample band)',
    summary:
      'A touring rig that fits in one van: twelve beams, a hazer and a cue list written around the band’s quietest song.',
    body: [
      'The band played rooms from 200 to 2,000 people. The rig had to look as large in a basement as it did in a hall, so it is built from beams, not washes: in haze, a beam is as tall as the room.',
      'Every cue is triggered by the drummer’s click track, so the show runs with no operator after the first night in a new room.'
    ],
    facts: [
      { value: 12, label: 'beams' },
      { value: 38, label: 'shows' },
      { value: 1, label: 'van' }
    ],
    credits: 'Programming: Studio Solvik. Touring crew: the band.'
  },
  {
    id: 'fyrregistret',
    scene: 4,
    title: 'Fyrregistret',
    kind: 'Interactive archive',
    place: 'Web',
    year: 2023,
    client: 'Maritime heritage society (sample)',
    summary:
      'Every light on the Swedish coast, flashing its real character on a night map. Find the one you grew up with and watch it blink at its own pace.',
    body: [
      'A lighthouse is identified at night by its character: three white flashes every ten seconds, one long red, and so on. The register lists them as codes nobody can read.',
      'The map plays each code in real time from the published light list. Visitors leave a memory on a light; the most visited is a small harbour light on Gotland.'
    ],
    facts: [
      { value: 1214, label: 'lights on the map', separator: ',' },
      { value: 38, label: 'distinct characters' },
      { value: 9, suffix: ' kB', label: 'per light, loaded on demand' }
    ],
    credits: 'Design and code: Studio Solvik. Light list: public maritime data.'
  },
  {
    id: 'kelvin-house',
    scene: 5,
    title: 'Kelvin House',
    kind: 'Hotel lobby',
    place: 'Oslo',
    year: 2022,
    client: 'Kelvin House hotel (sample)',
    summary:
      'A lobby whose light follows the sky outside, read once a minute from a sensor on the roof. Guests arriving at four in the afternoon in January walk into the same blue as the street.',
    body: [
      'Hotels light their lobbies like it is always seven in the evening. This one runs on the actual sky, so jet-lagged guests get the day back.',
      'Three cove circuits and the reading lamps are tuned between 1,900 and 6,500 kelvin; the front desk can hold the room warm for an event with a single switch.'
    ],
    facts: [
      { value: 1440, label: 'light changes a day', separator: ',' },
      { value: 3, label: 'cove circuits' },
      { value: 22, suffix: '%', label: 'less energy than before' }
    ],
    credits: 'Interior: hotel’s own team. Lighting and control: Studio Solvik.'
  },
  {
    id: 'nattbiblioteket',
    scene: 6,
    title: 'Nattbiblioteket',
    kind: 'Public square',
    place: 'Umeå',
    year: 2022,
    client: 'City culture office (sample)',
    summary:
      'One hundred and forty reading lamps on a snowy square. Each lamp comes on when someone sits beneath it and stays on for a minute after they leave.',
    body: [
      'The square had one mast light and nobody in it after four. We replaced the mast with chairs, each under a lamp at reading height.',
      'From the library windows above, the square shows who is there tonight, a constellation that changes all evening.'
    ],
    facts: [
      { value: 140, label: 'reading lamps' },
      { value: 60, suffix: ' s', label: 'of light after you leave' },
      { value: 2700, suffix: ' K', label: 'every lamp, no exceptions', separator: ',' }
    ],
    credits: 'Chairs: local carpentry school. Lamps and control: Studio Solvik.'
  }
];

export const editions = [
  { label: 'Kiruna 2025', variant: 0, text: '412 m, 96 arches, day to candle.', length: 412, arches: 96 },
  { label: 'Luleå 2024', variant: 1, text: 'A shorter first tunnel on the frozen harbour, all at tungsten.', length: 180, arches: 40 },
  { label: 'Umeå 2023', variant: 2, text: 'The prototype: blue moonlight only, for one weekend.', length: 60, arches: 14 }
];

export const teachers = [
  {
    img: '/img/candle.jpg',
    name: 'A candle',
    role: '1,900 kelvin',
    text: 'The first light I designed with: one candle in a window on Lucia morning. Anything warmer reads as fire, anything cooler starts to look like work.',
    w: 1200,
    h: 1500,
    pos: '42% 50%'
  },
  {
    img: '/img/gas-lamps.jpg',
    name: 'Gas lamps, Zagreb',
    role: 'Lit by hand, twice a day',
    text: 'A lamplighter still walks this street at dusk. Watching the lamps come on one by one is the best lesson in pacing a reveal I know.',
    w: 1200,
    h: 1500,
    pos: '18% 50%'
  },
  {
    img: '/img/fresnel.jpg',
    name: 'A Fresnel lens',
    role: 'Lighthouse optic',
    text: 'Rings of glass that bend one small flame into a beam seen twenty nautical miles out. Most of my work is trying to do more with fewer watts.',
    w: 1200,
    h: 1500,
    pos: '50% 40%'
  },
  {
    img: '/img/newton-prism.jpg',
    name: 'Newton’s prism',
    role: 'Diagram of refraction',
    text: 'White light is every colour at once. This hangs over my desk for the days a client asks for “just white”.',
    w: 1200,
    h: 1500,
    pos: '58% 50%',
    invert: true
  },
  {
    img: '/img/aurora-kiruna.jpg',
    name: 'Aurora over Kiruna',
    role: 'The one I will never beat',
    text: 'The only light show with no budget and no cue list. Midvinter was designed to dim itself whenever this was out.',
    w: 1200,
    h: 1500,
    pos: '40% 50%'
  }
];

export const rates = [
  { group: 'Commissions', items: [
    { kind: 'Installation', what: 'Concept to opening night, 4–9 months', price: 'from SEK 420,000' },
    { kind: 'Façade', what: 'Concept and lighting plan', price: 'from SEK 160,000' },
    { kind: 'Façade', what: 'Full delivery with control software', price: 'from SEK 380,000' }
  ] },
  { group: 'Stage', items: [
    { kind: 'Tour', what: 'Design, programming, first three shows', price: 'from SEK 140,000' },
    { kind: 'Single event', what: 'Design and operation on the night', price: 'from SEK 45,000' }
  ] },
  { group: 'Studio', items: [
    { kind: 'Interactive', what: 'Light-led web experiences', price: 'from SEK 120,000' },
    { kind: 'Night walk', what: 'Half a night on your site, with notes', price: 'SEK 9,500' },
    { kind: 'Workshop', what: 'Lighting the dark season, up to 20 people', price: 'SEK 14,000' }
  ] }
];
