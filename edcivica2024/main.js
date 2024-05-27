const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var mouse = {x: 0, y: 0}
var clicked = false

const FPS = 60
const BACK = "darkcyan"
const discElem = document.getElementById("disk");
const dvdLet = {before: document.getElementById("letdvd"), after: document.getElementById("letdvdcut")}
const arrow = document.getElementById("arrow")
const polaroid = document.getElementById("polaroid")

var discAnim = false
var onMenu = true
var room
var changeRoom = 0
var typeAnim = false
var transColor = "white"
var changePhysics = {
    speed: 0,
    acc: 2,
    pos: 0
}

class Img {
    constructor(id, dimx, dimy, posx, posy) {
        this.id = id
        this.dim = {
            x: dimx,
            y: dimy
        }
        this.pos = {
            x: posx,
            y: posy
        }
        this.src = document.getElementById(this.id)
        this.out = 10
        this.std = canvas.height/3
        this.isMoving = false
        this.off = {
            x: 0,
            y: 0
        }
        this.minX = 50
        this.speed = 0
        this.acc = 5
        this.inac = false
    }

    control() {
        if (clicked) {
            if (
                mouse.x >= this.pos.x - this.out && mouse.x <= this.pos.x + this.std + this.out
                && mouse.y >= this.pos.y - this.out && mouse.y <= this.pos.y + this.std + this.out
            ) {
                this.isMoving = true
                this.off.x = mouse.x - this.pos.x
                this.off.y = mouse.y - this.pos.y
            }
        } else {
            this.isMoving = false
        }
        
    }

    update() {
        if (this.isMoving) {
            this.pos.x = mouse.x - this.off.x
            this.pos.y = mouse.y - this.off.y
        } else {
            if (this.pos.x < this.minX) {
                this.pos.y += this.speed
                this.speed += this.acc

            }
            if (this.pos.y > canvas.height + 2*this.out) {
                this.inac = true
            }
        }
    }

    draw() {
        ctx.fillStyle = "white"
        ctx.fillRect(this.pos.x-this.out, this.pos.y-this.out, this.std+2*this.out, this.std+2*this.out)
        ctx.drawImage(this.src, 0, 0, this.dim.x, this.dim.y, this.pos.x, this.pos.y, this.std, this.std)
    }
}

class Room {
    constructor(args) {
        this.background = args.background
        this.backgroundDim = args.backgroundDim
        this.text = args.text
        this.fontSize = 50
        this.textColor = args.textColor
        this.textMax = args.textMax
        this.maxRows = args.maxRows
        this.words = args.words
        this.title = args.title
        this.xrect = 10

        this.startTextY = []
        this.startTextX = 150
        for (const text of this.text) {
            this.startTextY.push((canvas.height-this.fontSize*text.length)/2)
        }
        
        this.curToDraw = 0
        this.trans = false
        this.transPhase = false
        this.arrDim = 150
        this.arrOff = 20
        this.physics = {
            posLeft: 0,
            posRight: 0,
            acc: 5,
            speed: 0
        }
        this.images = []
        
    }

    control() {
        if (clicked) {
            if (
                mouse.x >= canvas.width-this.arrDim-this.arrOff && mouse.x <= canvas.width-this.arrOff
                && mouse.y >= canvas.height-this.arrDim-this.arrOff && mouse.y <= canvas.height-this.arrOff
            ) {
                if (this.curToDraw < this.text.length-1) {
                    this.trans = true
                } else {
                    onMenu = true
                    changeRoom = 1
                    resetDiscPos()
                }
            }
    
            this.words[this.curToDraw].forEach((word) => {
                if (
                    mouse.x >= this.startTextX+word.ix && mouse.x <= this.startTextX+word.ix+this.fontSize
                    && mouse.y >= this.startTextY[this.curToDraw] + (word.row+1/4)*this.fontSize
                    && mouse.y <= this.startTextY[this.curToDraw] + (word.row+5/4)*this.fontSize
                ) {
                    this.images.push(new Img(word.src, word.srcx, word.srcy, mouse.x, mouse.y))
                }
            })
        }
        
        this.images.forEach((image) => {
            image.control()
        })
    }

    update() {
        if (this.trans) {
            if (!this.transPhase) {
                this.physics.speed += this.physics.acc
                this.physics.posRight += this.physics.speed
                if (this.physics.posRight > this.textMax + this.xrect) {
                    this.physics.posRight = this.textMax + this.xrect
                    this.transPhase = true
                    this.curToDraw++;
                    this.physics.speed += 2*this.physics.acc
                }
            } else {
                this.physics.speed -= this.physics.acc
                this.physics.posLeft += this.physics.speed
                if (this.physics.posLeft > this.textMax + this.xrect) {
                    this.physics.posLeft = 0
                    this.physics.posRight = 0
                    this.transPhase = false
                    this.trans = false
                    this.physics.speed = 0
                }
            }
        }

        this.images.forEach((image, index, obj) => {
            if (image.inac) {
                obj.splice(index, 1)
            }
            image.update()
        })
    }

    draw() {
        ctx.drawImage(this.background, 0, 0, this.backgroundDim.x, this.backgroundDim.y, 0, 0, canvas.width, canvas.height)
        
        this.words[this.curToDraw].forEach((word) => {
            ctx.fillStyle = this.lightColor
            //ctx.fillRect(this.startTextX + word.ix, this.startTextY[this.curToDraw] + (word.row+1/4)*this.fontSize, word.fx-word.ix, this.fontSize)
            ctx.drawImage(polaroid, 0, 0, 348, 348, this.startTextX + word.ix, this.startTextY[this.curToDraw] + (word.row+1/4)*this.fontSize, this.fontSize, this.fontSize)
        })
        
        this.text[this.curToDraw].forEach((text, index) => {
            ctx.font = "35px Helvetica"
            ctx.textAlign = "left"
            ctx.fillStyle = this.textColor
            ctx.fillText(text, this.startTextX, this.startTextY[this.curToDraw]+this.fontSize*(1+index), this.textMax)
        })
        
        if (this.trans) {
            ctx.fillStyle = this.textColor
            ctx.fillRect(this.startTextX-this.xrect+this.physics.posLeft, (canvas.height-this.fontSize*(this.maxRows-1/2))/2, this.physics.posRight-this.physics.posLeft, this.fontSize*this.maxRows)    
        }

        ctx.fillRect(this.startTextX-this.xrect*1.5, (canvas.height-this.fontSize*(this.maxRows-1/2))/2, this.xrect/2, this.fontSize*this.maxRows)
        
        ctx.fillStyle = this.textColor
        ctx.textAlign = "center"
        ctx.font = "70px Helvetica"
        ctx.fillText(this.title, canvas.width/2, 100, 1000)

        this.images.forEach((image) => {
            image.draw()
        })

        ctx.drawImage(arrow, 0, 0, 320, 320, canvas.width-this.arrDim-this.arrOff, canvas.height-this.arrDim-this.arrOff, this.arrDim, this.arrDim)
    
    }
}

class Disk {
    constructor(startPos = {x: 0, y: 0}, text = "disco", color = "black", toroom = "mate") {
        this.pos = startPos
        this.text = text
        this.color = color
        this.dim = 200
        this.isDragged = false
        this.offSet = {x: 0, y: 0}
        this.startAnim = false;
        this.target = {x: canvas.width/2-50, y: canvas.height/2+65}
        this.speed = 3
        this.reached = false
        this.room = toroom
        this.startPos = {...startPos}
    }

    draw() {
        ctx.drawImage(discElem, this.pos.x - this.dim/2, this.pos.y - this.dim/2)
        ctx.fillStyle = "white"
        ctx.fillRect(this.pos.x-70, this.pos.y+25, 140, 30)
        ctx.fillStyle = this.color
        ctx.font = "bold 25px Helvetica"
        ctx.textAlign = "center"
        ctx.fillText(this.text, this.pos.x, this.pos.y+45, 140)
    }

    control() {
        if (clicked && !this.startAnim) {
            this.offSet.x = mouse.x - this.pos.x
            this.offSet.y = mouse.y - this.pos.y
            if (Math.hypot(this.offSet.x, this.offSet.y) <= this.dim/2) {
                this.isDragged = true
            }  else {
                this.isDragged = false
            }
        } else {
            this.isDragged = false
            if (Math.hypot(this.target.x-this.pos.x, this.target.y-this.pos.y) <= this.dim/2) {
                discAnim = true
                this.startAnim = true;
            }
        }
    }

    resetPos() {
        this.pos = {...this.startPos}
    }

    update() {
        if (this.isDragged) {
            this.pos.x = mouse.x - this.offSet.x
            this.pos.y = mouse.y - this.offSet.y
        }
        if (this.startAnim) {
            if (this.reached) {
                this.pos.y -= this.speed;
                if (this.target.y - this.pos.y > 250) {
                    changeRoom = 1;
                    room = new Room(this.room);
                    this.startAnim = false
                    transColor = this.color
                    onMenu = false
                    discAnim = false
                    this.reached = false
                }
            } else {
                let dir = Math.atan2(this.target.y-this.pos.y, this.target.x-this.pos.x)
                this.pos.x += this.speed * Math.cos(dir)
                this.pos.y += this.speed * Math.sin(dir)
                if (Math.hypot(this.target.x-this.pos.x, this.target.y-this.pos.y) <= 3) {
                    this.reached = true;
                }
            }
        }
    }
}

canvas.width = innerWidth;
canvas.height = innerHeight;

const discs = [
    new Disk({x:300, y:100}, "Hikikomori", "darkorchid", {
    background: document.getElementById("hikikomoriback"),
    backgroundDim: {x: 959, y: 639},
    title: "Hikikomori",
    text: [
        [
            "La sindrome di Hikikomori,       coniata dallo psichiatra",
            "giapponese Tamaki Saito, e' un fenomeno di auto-isolamento",
            "estremo. Si riferisce a individui, principalmente giovani tra",
            "i 15 e i 25 anni, che si ritirano volontariamente dalla vita",
            "sociale, preferendo rimanere soli per mesi o anni."
        ], [
            "Gli hikikomori si isolano dal mondo reale dormendo",
            "di giorno e chattando di notte. Le prinicipali cause",
            "sono:",
            "- molestie subite",
            "- introversione",
            "- assenza genitoriale",
            "- bullismo",
        ], [
            "Questo stato di isolamento puo' portare a:",
            "- letargia",
            "- incomunicabilita'",
            "- depressione",
            "- disadattamento sociale"
        ]
    ],
    textColor: "white",
    textMax: 800,
    maxRows: 7,
    words: [
        [
            {ix: 400, row: 0, src: "hikikomori1", srcx: 480, srcy: 480}
        ], [

        ], [

        ]
    ]}),
    new Disk({x:100, y:200}, "Phubbing", "royalblue", {
        background: document.getElementById("phubbingback"),
        backgroundDim: {x: 1200, y: 675},
        title: "Phubbing",
        text: [
            [
                "Il Phubbing e' un termine nato nel 2012 per descrivere",
                "l'abitudine di ignorare la compagnia degli altri, preferendo",
                "utilizzare lo smartphone o altri dispositivi digitali. Il termine",
                "deriva dalla fusione delle parole inglesi phone (telefono) e",
                "snubbing (snobbare)."
            ], [
                "Ci sono due attori in questo fenomeno: il phubber, che ignora",
                "gli altri, e il phubbee, che subisce le conseguenze di essere",
                "ignorato. Oggi, il phubbing e' comunemente definito come:",
                "l'atto di snobbare qualcuno in un contesto sociale, guardando",
                "il proprio telefono piuttosto che prestargli attenzione."
            ], [
                "Il phubbing ha effetti negativi sulle relazioni, sulla",
                "percezione di se', e puo' portare a sentimenti di esclusione,",
                "depressione, ansia e solitudine. Le cause del phubbing possono",
                "essere ricondotte alla dipendenza da smartphone e alla mancanza",
                "di autocontrollo, ma anche sintomo di una realta' non pienamente",
                "soddisfacente."
            ], [
                "Per combattere il phubbing, e' possibile adottare",
                "alcune strategie, come:",
                "- essere consapevoli del problema",
                "- utilizzare app detox",
                "- stabilire momenti in cui spegnere lo smartphone",
                "- vivere nel presente."
            ]
        ],
        textColor: "white",
        textMax: 1000,
        maxRows: 6,
        words: [
            [
                
            ], [
                {ix: 830, row: 4, src: "phubbing1", srcx: 183, srcy: 183}
            ], [
    
            ], [

            ]
    ]}),
    new Disk({x:100, y:canvas.height-200}, "Storia dell'IA", "darkslategray", {
        background: document.getElementById("aiback"),
        backgroundDim: {x: 2560, y: 1550},
        title: "Storia dell'IA",
        text: [
            [
                "L'intelligenza artificiale rappresenta uno dei piu' ambiziosi",
                "sforzi umani: replicare l'intelligenza umana attraverso",
                "macchine. Le sue radici filosofiche risalgono a millenni",
                "fa, con il mito di Pigmalione e il Golem, riflettendo il",
                "desiderio umano di creare vita artificiale.",
            ], [
                "Quest'introduzione e' stata scritta usando un'intelligenza",
                "artificiale, facendo comprendere come l'IA abbia progredito",
                "fino al 2024.",
            ], [
                "Molte intelligenze artificiali di oggi si basano sulla rete",
                "neurale, un modello computazionale di apprendimento ispirato",
                "al funzionamento dei neuroni.",
                "",
                "Il primo ad aver usato il concetto di rete neurale, senza",
                "neanche sapere il funzionamento dei neuroni, e' stato il",
                "filosofo Raimondo Lullo, che con la sua Ars Magna",
                "permette di effettuare ragionamenti usando una tavola.",
            ], [
                "Anche il matematico Leibniz ha in un certo senso anticipato il",
                "concetto di intelligenza artificiale.",
                "",
                "Lui aveva creato una macchina      che permetteva di svolgere le",
                "quattro operazioni aritmetiche utilizzando il linguaggio binario, da",
                "cui rimase colpito per la sua semplicita' (uso di soli 0 e 1).",
            ], [
                "Aveva cosi' trasformato il ragionamento in calcolo. Leibniz inizio'",
                "quindi a pensare che tutti i ragionamenti umani si potessero",
                "ridurre a meri calcoli.",
                "",
                "Leibniz fu quindi il primo a immaginare una macchina capace di risolvere",
                "tutti i problemi umani attraverso il calcolo. In questo modo, una diatriba",
                "tra due filosofi si sarebbe risolta con un semplice calcolo.",
            ], [
                "Oggi il sogno di Leibniz non si e' chiaramente avverato, ma sono",
                "stati svolti degli sviluppi nel campo. Con la Conferenza di",
                "Dartmouth del 1956 viene introdotto il termine 'Intelligenza",
                "Artificiale' per la prima volta."
            ], [
                "Questi sviluppi sono dovuti in parte al lavoro di Alan Turing, inventore",
                "del 'Test di Turing', un test utile a scoprire se una macchina e'",
                "davvero intelligente quanto un umano.",
                "",
                "Il test consiste nel posizionare un uomo e un computer dietro un",
                "muro e farli parlare. Se una persona davanti al muro non e' capace",
                "di distinguere l'umano dall'intelligenza artificiale, il test",
                "viene superato."
            ], [
                "Nella sua forma piu' bruta, oggi il test di Turing e' stato superato",
                "da alcune IA, ma questo non significa che queste macchine siano",
                "effettivamente in grado di pensare. Invece, le IA di oggi non hanno",
                "idea di cio' che dicono: sono piu' dei 'pappagalli ammaestrati'."
            ], [
                "Ad esempio, se a modelli di linguaggio come ChatGPT viene chiesto",
                "quanto fa 2+2, ti rispondera' che fa 4, ma solo perche' 2+2=4 e' piu'",
                "presente nel suo database di 2+2=5 e non perche' 2+2=4 e' la verita'.",
                "Anzi, non sa neanche cosa sia il concetto di verita'. Eppure, se gli",
                "venisse chiesto cos'e' la verita', ne potrebbe scrivere per pagine intere.",
            ]
        ],
        textColor: "white",
        textMax: 1000,
        maxRows: 8,
        words: [
            [
                
            ], [

            ], [
                {ix: 800, row: 6, src: "arsmagna", srcx: 450, srcy: 450}
            ], [
                {ix: 490, row: 3, src: "calcolatrice", srcx: 165, srcy: 165}
            ], [

            ], [

            ], [
                {ix: 600, row: 2, src: "turing", srcx: 220, srcy: 282}
            ], [

            ], [

            ]
    ]}),
    new Disk({x:300, y:canvas.height-100}, "Arte e IA", "firebrick", {
        background: document.getElementById("arteback"),
        backgroundDim: {x: 1280, y: 720},
        title: "Arte e IA",
        text: [
            [
                "L'arte generata dall'intelligenza artificiale, o arte",
                "AI, e' un campo in rapida crescita che combina la",
                "creativita' umana con le capacita' di apprendimento delle",
                "macchine.",
            ], [
                "Gli artisti stanno sfruttando gli algoritmi di",
                "intelligenza artificiale per generare nuove idee,",
                "spingere i confini dell'arte tradizionale e creare",
                "opere d'arte uniche.",
            ], [
                "Una tecnologia chiave utilizzata nell'arte AI sono le",
                "reti Generative Adversarial Networks (GAN). Queste reti",
                "sono composte da due parti: un generatore che crea",
                "immagini e un discriminatore che cerca di distinguere",
                "tra le immagini reali e quelle generate dal generatore.",
            ], [
                "Gli artisti si sono quindi interessati a come la macchina",
                "'vede', cioe' interpreta i dati visivi. E questo puo'",
                "includere l'analisi di  immagini e video per rilevare oggetti,",
                "persone, segnali stradali e altre caratteristiche.",
            ], [
                "Questa capacita' di 'vedere' come una macchina sta",
                "aprendo nuove possibilita' per gli artisti, permettendo",
                "loro di esplorare nuovi approcci alla creazione",
                "artistica."
            ], [
                "Al MOMA (Museum Of Modern Art) e' stato esposto",
                "'Unsupervised'       di Refik Anadol, un'opera creata",
                "utilizzando l'IA che mira a scoprire come una macchina",
                "'pensa', cambiando forma continuamente.",
            ]
        ],
        textColor: "white",
        textMax: 800,
        maxRows: 5,
        words: [
            [
                
            ], [
    
            ], [
                
            ], [

            ], [

            ], [
                {ix: 240, row: 1, src: "unsupervised", srcx: 1519, srcy: 1519}
            ]
    ]}),
    new Disk({x:canvas.width-300, y:canvas.height-100}, "Articolo 38", "darkorange", {
        background: document.getElementById("art38back"),
        backgroundDim: {x: 2560, y: 1656},
        title: "L'Articolo 38",
        text: [
            [
                "L'Articolo 38 della Costituzione Italiana e' parte",
                "del settore della sicurezza sociale, quel settore",
                "che si occupa di sancire le condizioni minime di",
                "vita a cui ogni inviduo ha diritto.",
            ], [
                "Questo articolo si inserisce nel piu' ampio contesto",
                "dei diritti sociali, che sono distinti dai diritti",
                "naturali (inalienabili e universali) perche' interessano",
                "solo i cittadini in un particolare disagio economico",
                "e sociale.",
            ], [
                "L'articolo cosi' recita:",
                "''Ogni cittadino inabile al lavoro e sprovvisto dei",
                "mezzi necessari per vivere ha diritto al mantenimento",
                "e all'assistenza sociale. Inoltre, i lavoratori hanno",
                "diritto ad avere assicurati mezzi adeguati alle loro",
                "esigenze di vita in caso di: infortunio, malattia,",
                "invalidita', vecchiaia, disoccupazione involontaria.''",
            ], [
                "Questo implica che lo stato deve farsi carico delle",
                "necessita' vitali dei suoi cittadini piu' vulnerabili.",
                "Cosi' lo stato mette a disposizione vari strumenti:",
                "- Pensioni di invalidita' e vecchiaia,",
                "- Assicurazioni contro infortuni sul lavoro e malattie,",
                "- Assistenza per i disoccupati",
            ]
        ],
        textColor: "white",
        textMax: 800,
        maxRows: 7,
        words: [
            [
                
            ], [
    
            ], [
    
            ], [

            ]
    ]}),
    new Disk({x:canvas.width-100, y:canvas.height-200}, "Legge 242/16", "mediumseagreen", {
        background: document.getElementById("legge242back"),
        backgroundDim: {x: 1792, y: 1024},
        title: "Regolamentazione della cannabis",
        text: [
            [
                "La Legge 242/2016 e' stata promulgata il 2 dicembre",
                "2016 e mira a promuovere la coltivazione e lo",
                "sviluppo della filiera agroindustriale della canapa in",
                "Italia. Questa normativa e' entrata in vigore il",
                "14 gennaio 2017."
            ], [
                "Questa legge sancisce che le varieta' di canapa, che",
                "si possono coltivare, sono solo quelle presenti in un",
                "apposito catalogo e il cui contenuto di THC deve essere",
                "minore di 0.2%.",
            ], [
                "La canapa non puo' essere coltivata a scopo",
                "ricreativo, ma per i seguenti usi:",
                "- Alimentare",
                "- Cosmetico",
                "- Industriale",
            ]
        ],
        textColor: "white",
        textMax: 800,
        maxRows: 5,
        words: [
            [
                
            ], [
    
            ], [
                {ix: 200, row: 2, src: "oliodicanapa", srcx: 494, srcy: 494},
                {ix: 200, row: 3, src: "calmante", srcx: 832, srcy: 1000},
                {ix: 200, row: 4, src: "bioedilizia", srcx: 514, srcy: 577},
            ]
    ]}),
    new Disk({x:canvas.width-100, y:200}, "Eff. del fumo", "sandybrown", {
        background: document.getElementById("nicotinaback"),
        backgroundDim: {x: 960, y: 640},
        title: "Effetti della nicotina",
        text: [
            [
                "La nicotina e' una sostanza che puo' creare una",
                "forte dipendenza. Questa dipendenza puo' essere",
                "sia fisica che psicologica.",
            ], [
                "La nicotina       agisce sul cervello e si fa scambiare",
                "per acetilcolina,       un neurotrasmettitore responsabile",
                "del rilascio di dopamina, che e' la sostanza chimica del",
                "cervello legata alla motivazione primaria.",
            ], [
                "Quando una persona fuma, la nicotina entra nel flusso",
                "sanguigno e raggiunge il cervello in pochi secondi. Li',",
                "si lega ai recettori dell'acetilcolina, causando il",
                "rilascio di dopamina. ",
            ], [
                "Questo provoca una sensazione di piacere e benessere,",
                "che il cervello associa al fumo. Di conseguenza, il",
                "cervello inizia a desiderare piu' nicotina per ricreare",
                "quella sensazione, creando cosi' una dipendenza.",
            ], [
                "La quantita' di nicotina che puo' causare dipendenza varia",
                "da persona a persona. Alcune persone possono sviluppare",
                "una dipendenza fumando solo un paio di sigarette al giorno,",
                "mentre altre possono fumare di piu' senza diventare",
                "dipendenti.",
            ], [
                "Smettere di fumare puo' essere molto difficile a causa della",
                "forte dipendenza dalla nicotina. Se stai cercando di smettere,",
                "potrebbe essere utile cercare supporto e consulenza",
                "professionale. Ricorda, non sei solo in questo percorso e ci",
                "sono molte risorse disponibili per aiutarti. Buona fortuna!",
            ]
        ],
        textColor: "white",
        textMax: 1000,
        maxRows: 5,
        words: [
            [
                
            ], [
                {ix: 180, row: 0, src: "nicotina", srcx: 260, srcy: 260},
                {ix: 250, row: 1, src: "acetilcolina", srcx: 1200, srcy: 1200},
            ], [
                
            ], [

            ], [

            ], [

            ]
    ]}),
    new Disk({x:canvas.width-300, y:100}, "Rel. e droga", "seagreen", {
        background: document.getElementById("reliback"),
        backgroundDim: {x: 1224, y: 816},
        title: "Religione e droga",
        text: [
            [
                "Il cristianesimo, in particolare la Chiesa",
                "cattolica, si oppone fermamente all'uso di droghe.",
                "Papa Francesco, ad esempio, ha criticato la",
                "legalizzazione delle droghe leggere, sostenendo",
                "che esse non risolvono i problemi alla base",
                "della dipendenza ma li aggravano.",
            ], [
                "Invece la Chiesa trova nell'educazione ai valori e",
                "nella promozione della giustizia le soluzioni per",
                "affrontare le cause profonde dell'uso di droga.",
            ], [
                "In alcune religioni orientali, come l'induismo e",
                "il taoismo, la cannabis ha storicamente avuto un",
                "ruolo nei rituali spirituali. Nei testi sacri indu',",
                "la cannabis e' considerata una pianta sacra, mentre",
                "nel taoismo veniva usata per le sue proprieta' rilassanti",
                "e allucinogene, facilitando esperienze spirituale.",
            ], [
                "Il rastafarianesimo vede la cannabis come 'l'erba",
                "della saggezza' e la utilizza durante le 'sessioni",
                "di ragionamento' per avvicinarsi a Dio. Tuttavia,",
                "condanna l'uso di droghe pesanti e altre sostanze",
                "come tabacco e alcol, considerate dannose per il",
                "corpo e la mente.",
            ], [
                "Molte altre tradizioni religiose, come il sufismo",
                "nell'Islam, vietano l'uso di droghe perche' possono",
                "distogliere l'individuo dal cammino spirituale e",
                "dalla connessione con Dio.",
            ], [
                "Le diverse posizioni religiose riflettono una",
                "preoccupazione comune per la salute fisica e mentale",
                "dei fedeli, nonche' per la loro crescita spirituale.",
                "In molte tradizioni, l'uso di droghe e' visto come una",
                "fuga dai problemi, e le comunita' religiose tendono a",
                "promuovere alternative basate su valori, supporto",
                "comunitario e fede.",
            ]
        ],
        textColor: "white",
        textMax: 800,
        maxRows: 7,
        words: [
            [
                
            ], [
    
            ], [
    
            ], [

            ], [

            ], [

            ]
    ]}),
];

function menu() {
    ctx.fillStyle = BACK
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const disc of discs) {
        disc.update()
    }
    ctx.drawImage(dvdLet.before, canvas.width/2-200, canvas.height/2-135);
    for (const disc of discs) {
        disc.draw()
    }
    if (discAnim || changeRoom == 1) {
        ctx.drawImage(dvdLet.after, canvas.width/2-200, canvas.height/2-135);
        ctx.fillStyle = BACK;
        ctx.fillRect(canvas.width/2-200, canvas.height/2-435, 400, 302)
    }
}

function changeRoomAnim() {
    ctx.fillStyle = transColor

    if (changeRoom == 1) {
        changePhysics.speed += changePhysics.acc
        changePhysics.pos += changePhysics.speed
        ctx.fillRect(0, 0, canvas.width, changePhysics.pos)
        if (changePhysics.pos >= canvas.height) {
            changePhysics.pos = 0
            changePhysics.speed += 2*changePhysics.acc
            changeRoom = 2
        }
    } else if (changeRoom == 2) {
        changePhysics.speed -= changePhysics.acc
        changePhysics.pos += changePhysics.speed
        ctx.fillRect(0, changePhysics.pos, canvas.width, canvas.height)
        if (changePhysics.pos >= canvas.height) {
            changePhysics.pos = 0
            changeRoom = 0
            changePhysics.speed = 0
        }
    }
}

function resetDiscPos() {
    for (const disc of discs) {
        disc.resetPos()
    }
}


function loop() {
    requestAnimationFrame(loop);
    setTimeout(() => {
        if (onMenu && (changeRoom == 0 || changeRoom == 2) || !onMenu && changeRoom == 1) {
            menu()
        } else {
            ctx.fillStyle = BACK
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            room.update()
            room.draw()
        }

        if (changeRoom != 0) {
            changeRoomAnim()
        }

    }, 1000 / FPS)
}

loop();

addEventListener("mousedown", (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY

    clicked = true

    if (onMenu) {
        for (const disc of discs) {
            disc.control()
        }
    } else {
        room.control()
    }
    event.preventDefault()
})

addEventListener("mousemove", (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY

})

addEventListener("mouseup", (event) => {
    clicked = false

    if (onMenu) {
        for (const disc of discs) {
            disc.control()
        }
    } else {
        room.control()
    }
    event.preventDefault()
})

addEventListener("touchstart", (event) => {
    mouse.x = event.touches[0].clientX
    mouse.y = event.touches[0].clientY

    clicked = true

    if (onMenu) {
        for (const disc of discs) {
            disc.control()
        }
    } else {
        room.control()
    }
    event.preventDefault()
})

addEventListener("touchend", (event) => {
    clicked = false

    if (onMenu) {
        for (const disc of discs) {
            disc.control()
        }
    } else {
        room.control()
    }
    event.preventDefault()
})

addEventListener("touchmove", (event) => {
    mouse.x = event.touches[0].clientX
    mouse.y = event.touches[0].clientY
})
