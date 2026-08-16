/**
 * Embedded word list for Word Chain.
 *
 * Word Chain scores verbal fluency, so it has to know what a word is —
 * otherwise "aa bb cc" scores full marks and the score measures typing, not
 * fluency. Shipping a full dictionary would dominate the bundle, so this is a
 * hand-written list of common English words: enough coverage for the prompts
 * the game actually generates, small enough to be a rounding error.
 *
 * Stored as whitespace-separated text rather than array literals purely for
 * size and readability; it is split once at module load.
 *
 * The prompts draw start letters from 'ABCDEFGHIJKLMNOPRSTW' and end letters
 * from 'ADEGILMNORST', and a round can ask for up to 12 words, so every one of
 * those letters needs a comfortable margin of entries. `wordlist.test.ts`
 * enforces that invariant.
 */

const split = (s: string): string[] => s.trim().split(/\s+/);

/** Category prompts. A word counts only if it is in the named category. */
export const CATEGORIES: Record<string, string[]> = {
  Animals: split(`
    cat dog bird fish lion bear wolf deer hawk frog snake whale shark eagle tiger
    zebra horse mouse goat duck swan crab seal dove crow moth wasp ant bee owl
    rabbit monkey donkey badger beaver otter camel llama sheep mole rat bat fox
    cow pig hen ram doe cub calf lamb foal colt bull toad newt slug snail worm
    spider beetle cricket locust hornet finch robin raven stork heron crane quail
    parrot pigeon turkey falcon osprey walrus dolphin panther leopard cheetah
    buffalo bison moose elk lynx hare ferret weasel skunk squirrel hedgehog
    tortoise lizard gecko iguana python cobra viper salmon trout carp perch eel
    octopus lobster shrimp oyster clam mussel jellyfish starfish
  `),
  Foods: split(`
    rice cake bread soup fish meat corn bean plum lime pear date fig jam nut pie
    ham yam oat egg milk salt sage mint dill kale tofu lamb veal tuna apple grape
    peach mango lemon melon berry olive onion garlic potato tomato carrot celery
    pepper ginger butter cheese cream yogurt honey sugar flour pasta noodle bagel
    toast waffle pancake muffin cookie biscuit pudding custard sorbet cereal
    oatmeal porridge steak bacon sausage chicken turkey salad broth stew curry
    pizza taco burrito sandwich omelette pastry donut brownie cracker pretzel
    almond walnut peanut cashew pecan raisin apricot cherry banana orange papaya
    coconut pumpkin spinach lettuce cabbage broccoli cucumber radish turnip beet
  `),
  Colors: split(`
    red blue gold pink gray grey teal lime plum ruby jade navy rose sage rust
    wine sand coal snow moss fawn black white green brown amber ivory cream beige
    coral cyan violet purple orange yellow silver bronze copper crimson scarlet
    maroon magenta lavender indigo turquoise olive emerald amethyst charcoal
    peach salmon mauve khaki tan slate ochre saffron burgundy chestnut mustard
  `),
  'Body Parts': split(`
    arm leg eye ear toe lip hip rib jaw shin knee palm nail bone skin hair back
    neck foot hand head face chest waist thumb wrist ankle elbow thigh calf heel
    chin cheek brow lash tooth tongue throat spine skull pelvis muscle tendon
    artery vein nerve brain heart lung liver kidney stomach shoulder finger
    knuckle eyelid eyebrow forearm forehead temple nostril gum scalp joint
  `),
  Nature: split(`
    tree lake hill rain snow wind rock sand clay moss vine leaf root bark wave
    tide reef cave peak vale river creek stream pond marsh swamp meadow forest
    jungle desert canyon valley cliff shore beach coast island glacier volcano
    mountain hillside woodland grass fern bush shrub flower petal seed pollen
    branch trunk stump thorn pebble boulder gravel soil earth storm cloud thunder
    lightning breeze frost dew mist fog hail sunrise sunset moon star comet
  `),
};

/**
 * General vocabulary for the "starts with" / "ends with" prompts.
 * Category words are folded into the lexicon below as well.
 */
const GENERAL = split(`
  able about above accept across action actor adapt admit adult after again
  agree ahead alarm album alert alike alive allow almost alone along aloud alter
  among anchor angel anger angle animal ankle answer anyone apart appeal appear
  apple apply april arcade arch arena argue arise armor around arrive arrow
  artist aside asleep aspect assist assume attach attempt attend august author
  auto autumn avenue avoid awake award aware away agenda aroma arena aurora
  bacon badge badly bakery balance ball balloon banana band bandage bank banner
  barrel basic basket batch bath battle beach beacon beam bean beard beauty
  because become bedroom before begin behave behind being belief belong below
  bench bend benefit berry beside better between beyond bicycle bigger bind
  birth bishop bitter blade blame blank blanket blast blend bless blind block
  blood bloom blossom board boast boat bold bolt bond bonus book boost border
  borrow bottle bottom bounce bound bowl brace brain branch brand brave bread
  break breath breeze brick bridge brief bright bring broad broken bronze brook
  brother brown brush bubble bucket budget build bunch bundle burden burn burst
  bury business busy butter button buyer banjo bingo
  cabin cable cactus cage calm camera camp canal candle candy canvas canyon
  capable capital captain capture carbon card care career careful cargo carpet
  carry cart carve case castle catch cause caution cave cease ceiling cell
  cement center central century certain chain chair chalk chamber champion
  chance change chapter charge charm chart chase cheap check cheer cheese chest
  chief child chill choice choose chorus circle circuit citizen city civil claim
  clarity classic clean clear clever cliff climate climb clinic clock close
  cloth cloud clover clown club clue coach coast coat cobalt coffee coin cold
  collar collect college colony color column combine come comfort comic command
  comment common compare compass complete concept concert concrete condition
  conduct confirm connect consent consider constant contact contain content
  contest context continue contrast control convert cook cool copper copy coral
  cord core corner correct cost cottage cotton council count country couple
  courage course court cousin cover craft crane crash crater crawl cream create
  creature credit creek crew cricket crime crisp critic crop cross crowd crown
  crucial cruise crumb crush crystal cube culture cup cure curious current
  curtain curve custom cycle cinema cocoa
  daily dairy damage dance danger daring dark data date dawn daylight dazzle
  deal dear debate debris decade decide declare decline decorate deep defeat
  defend define degree delay delicate deliver demand denim dense depart depend
  deposit depth derive descend describe desert design desire desk destiny
  detail detect develop device devote diagram dial diamond diary dictate differ
  digital dignity diner dinner direct dirt disagree discover discuss disease
  dish dismiss display distance district disturb dive divide doctor document
  dodge dollar domain dome donate door double doubt dough dozen draft drag
  dragon drain drama draw dream dress drift drill drink drive drop drum dry
  dual during dust duty dwell dynamic delta drama
  eager eagle early earn earth easel east easy eat echo edge edit educate effect
  effort eight either elastic elbow elder elect element elegant elevate elite
  else email embark embrace emerald emerge emotion empire employ empty enable
  enact enchant encode encounter end endless endure enemy energy engage engine
  enhance enjoy enlist enough enrich ensure enter entire entry envelope episode
  equal equator equip erase error escape escort essay essence estate eternal
  evening event ever every evidence exact exam example exceed excel except
  exchange excite exclude excuse exercise exhale exhibit exist exit expand
  expect expert explain explore export expose express extend extra extreme eye
  fabric face fact factor fade fail faint fair faith fall false fame family
  famous fancy fantasy far farm fashion fast fasten fate father fault favor fear
  feast feather feature federal feed feel fellow female fence fern ferry festival
  fetch fever few fiber fiction field fierce fifty fight figure file fill film
  filter final finance find fine finger finish fire firm first fish fist fit fix
  flag flame flash flat flavor fleet flesh flight float flock flood floor flour
  flow flower fluid flute focus fold folk follow fond food fool foot force
  forecast forest forever forge forget fork form formal format former fortune
  forward fossil foster found fountain fourth frame free freeze frequent fresh
  friend fringe frog front frost frozen fruit fuel full fun function fund funny
  furnace furniture further future formula fiesta
  gadget gain galaxy gallery gallon game gap garage garden garlic garment gate
  gather gauge gaze gear general generous gentle genuine gesture ghost giant
  gift ginger giraffe girl give glacier glad glance glass gleam glide glimpse
  globe gloom glory glove glow glue goal goat gold golden good govern gown grab
  grace grade grain grand grant grape graph grasp grass grateful grave gravity
  gray great green greet grid grill grind grip groan grocery ground group grove
  grow guard guess guest guide guitar gulf gum gust gala gorilla
  habit hair half hall halt hammer hand handle hang happen happy harbor hard
  hardly harm harmony harvest haste hat hatch haul haven hawk hazard haze head
  heal health heap hear heart heat heaven heavy hedge heel height helmet help
  herb herd here hero hidden hide high highway hill hint hire history hobby hold
  hole holiday hollow holy home honest honey honor hood hook hope horizon horn
  horse hospital host hotel hour house hover howl huge human humble humid humor
  hundred hunger hunt hurry hurt husband hybrid hymn halo hello
  ice icon idea ideal identify idle ignite ignore illness image imagine imitate
  immune impact imply import impose impress improve impulse inch incident
  include income increase indeed index indicate indoor industry infant infer
  inflate inform inhale initial injure ink inland inner innocent input inquire
  insect insert inside insight inspect inspire install instant instead instinct
  insult intact intend intense interest interior internal interval into
  introduce invade invent invest invite involve iron island issue item ivory
  jacket jade jail jam january jar jazz jeans jelly jewel job jog join joint
  joke journal journey joy judge juice july jump june jungle junior jury just
  justice
  keen keep kernel kettle key kick kid kind kindle king kiss kit kitchen kite
  kitten knee kneel knife knight knit knob knock knot know knowledge known
  label labor lace lack ladder lady lake lamp land lane language lantern lap
  lava logo llama
  large last late laugh launch laundry law lawn layer lazy lead leaf league lean
  leap learn lease least leather leave lecture ledge left legacy legal legend
  lemon lend length lens lesson letter level lever liberty library license lid
  life lift light like limb lime limit line linen link lion liquid list listen
  little live load loaf loan lobby local lock lodge log logic lonely long look
  loop loose lord lose loss lost lot loud love lower loyal luck lumber lunar
  lunch lung luxury
  machine magic magnet maid mail main major make male mammal manage manner
  mansion manual many map marble march margin marine mark market marry marsh
  mask mass master match mate math matter mature maximum maybe mayor meadow meal
  mean measure meat medal media medical medium meet melody melt member memory
  mental mention menu mercy mere merge merit merry message metal method middle
  might mild mile milk mill mind mineral minute miracle mirror mission mist mix
  mobile model modern modest moment monitor monkey month monument mood moon moral
  more morning mortal most mother motion motor mount mountain mouse mouth move
  movie much mud muscle museum music must mutual myself mystery myth motto
  nail name narrow nation native natural nature navy near neat neck need needle
  negative neighbor nerve nest net network neutral never new news next nice
  night nine noble nod noise none noon normal north nose note notice notion
  novel now nowhere nuclear number nurse nut nutrition
  oak oath obey object observe obtain obvious occasion occupy occur ocean odd
  offer office often oil okay old olive omit once one onion online only onto
  open opera operate opinion oppose option orange orbit orchard order ordinary
  organ organic origin other ought ounce outcome outdoor outer outline output
  outside oven over overcome overlook owe own owner oxygen oyster
  pace pack page pain paint pair palace pale palm panel panic paper parade
  parcel parent park parrot part partner party pass passage passion past pasta
  patch path patient pattern pause pave payment peace peak pearl pedal peer
  pencil people pepper perfect perform perhaps period permit person pet phase
  phone photo phrase piano pick picture piece pierce pile pilot pine pink
  pioneer pipe pitch place plain plan planet plant plastic plate platform play
  plaza pleasant please pledge plenty plot plug plum plunge pocket poem poet
  point polar police policy polish polite pond pool poor popular port portion
  portrait pose position positive possible post potato potential pound pour
  powder power practice praise pray precise prefer premium prepare present
  preserve press pretty prevent previous price pride primary prime print prior
  prison private prize problem proceed process produce product profile profit
  program progress project promise promote proof proper propose protect proud
  prove provide public pull pulse pump punch pupil purchase pure purple purpose
  pursue push puzzle panda patio plasma
  quality quantity quarter queen quest question quick quiet quilt quit quite
  quota quote
  rabbit race radar radio raft rail rain raise rally ranch random range rank
  rapid rare rate rather ratio raw ray reach react read ready real reason rebel
  recall receive recent recipe record recover red reduce refer reflect reform
  refuse regard region regret regular reject relate relax release relief remain
  remark remedy remember remind remote remove render renew rent repair repeat
  replace reply report request require rescue research reserve resist resolve
  resort resource respect respond rest result retain retire retreat return
  reveal reverse review reward rhythm ribbon rice rich ride ridge rifle right
  rigid ring rinse riot rise risk ritual rival river road roar roast robot rock
  rocket rod role roll roof room root rope rose rotate rough round route routine
  row royal rubber ruin rule rumor run rural rush rust
  sacred sad safe sail salad salt sample sand satisfy sauce save scale scan
  scarce scatter scene scent schedule scheme scholar school science scope score
  screen script sculpt sea seal search season seat second secret section secure
  seed seek seem seize seldom select self sell send senior sense sentence
  separate sequence series serious serve session settle seven several severe
  shade shadow shake shall shallow shame shape share sharp shed sheep sheet
  shelf shell shelter shield shift shine ship shirt shock shoe shoot shop shore
  short should shoulder shout show shower shrink shut shy sick side sight sign
  signal silence silk silver similar simple since sing single sink sister sit
  site situation size skate sketch ski skill skin skirt sky slab slate sleep
  slice slide slight slim slip slope slow small smart smell smile smoke smooth
  snake snap snow soap social society sock soft soil solar soldier solid solve
  some song soon sorry sort soul sound soup source south space spare spark speak
  special speech speed spell spend sphere spice spider spill spin spirit split
  spoke sponsor spoon sport spot spray spread spring square squeeze stable stack
  staff stage stair stamp stand star stare start state station stay steady steam
  steel steep stem step stick still stir stock stone stop store storm story
  stove straight strange stream street strength stress stretch strict strike
  string strip strong struggle student studio study stuff style subject submit
  subtle succeed such sudden suffer sugar suggest suit summer summit sun super
  supply support suppose sure surface surge surprise surround survey survive
  suspect sustain swallow swamp swan swap swear sweat sweep sweet swell swift
  swim swing switch sword symbol system saga soda sofa solo studio
  table tackle tail take tale talent talk tall tame tank tape target task taste
  tax tea teach team tear tech tell temper temple tempt tend tender tennis tense
  tent term terrain test text than thank that theme then theory there thermal
  thick thin thing think third thirst thorough those though thought thread
  threat three thrill throat throne through throw thumb thunder ticket tide tidy
  tie tiger tight tile timber time timid tin tiny tip tired tissue title toast
  today toe together toil token tomato tone tongue tonight tool tooth top topic
  torch total touch tough tour toward tower town toy trace track trade
  tradition traffic trail train trait transfer transit translate trap travel
  tray treat tree trend trial tribe trick trigger trim trip triumph troop
  trophy trouble truck true trumpet trust truth try tube tune tunnel turn
  turtle twelve twenty twice twin twist type typical tempo tornado tuba
  ultimate umbrella unable uncle under undergo understand undo unfair uniform
  union unique unit unite universe unknown unless unlike until unusual upon
  upper upset urban urge usage use useful usual utility
  vacant vacation vague valid valley value valve van vanish vapor variety
  various vast vault vector vehicle veil velvet vendor venture venue verb
  verify verse version vertical very vessel veteran victory video view village
  vine vinegar violet violin virtue visible vision visit visual vital vivid
  vocal voice void volume volunteer vote vowel voyage villa vista
  wage wagon wait wake walk wall wander want war warden warm warn warrant wash
  waste watch water wave wax way weak wealth weapon wear weather weave wedge
  week weigh welcome welfare well west wet whale wheat wheel when where whether
  which while whisper whistle white whole why wide widow width wife wild will
  win wind window wine wing winter wipe wire wisdom wise wish witness wolf woman
  wonder wood wool word work world worry worth wound wrap wreck wrist write
  wrong
  yard yarn year yeast yellow yes yesterday yet yield yoga yogurt young youth
  zebra zenith zero zone zoom
`);

/**
 * Every word the game will accept, lower-cased.
 * Built from the general list plus all category words.
 */
export const LEXICON: ReadonlySet<string> = new Set<string>([
  ...GENERAL,
  ...Object.values(CATEGORIES).flat(),
]);

/** True if `word` is in the embedded lexicon (case-insensitive). */
export function isWord(word: string): boolean {
  return LEXICON.has(word.trim().toLowerCase());
}

/** True if `word` belongs to the named category. */
export function isInCategory(word: string, category: string): boolean {
  const list = CATEGORIES[category];
  if (!list) return false;
  return list.includes(word.trim().toLowerCase());
}
