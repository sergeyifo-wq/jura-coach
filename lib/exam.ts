export type Choice = { id: string; text: string };

export type ExamQuestion = {
  id: string;
  chapterId: string;
  points: number;
  prompt: string;
  choices: Choice[];
  answer: string;
  explanation: string;
};

export const questions: ExamQuestion[] = [
  {
    id: "q01",
    chapterId: "1",
    points: 4,
    prompt:
      "Ein Gast erscheint im Jogginganzug zu einer Hochzeit. Welche Ordnung ist verletzt?",
    choices: [
      { id: "a", text: "Recht: Es droht eine Klage auf angemessenes Auftreten." },
      { id: "b", text: "Sitte: Es trifft eine gesellschaftliche Erwartung, Folge ist Missbilligung." },
      { id: "c", text: "Brauch: Es fehlt nur eine regelmäßige Übung ohne jeden Tadel." },
      { id: "d", text: "Keine Ordnung: Kleidung ist rechtlich und gesellschaftlich frei." },
    ],
    answer: "b",
    explanation:
      "Die Hochzeitskleidung ist eine gesellschaftliche Erwartung. Wer sie verletzt, handelt gegen die Sitte. Eine staatliche Durchsetzung gibt es nicht, also liegt kein Rechtsverstoß vor.",
  },
  {
    id: "q02",
    chapterId: "1",
    points: 4,
    prompt:
      "Kellner K hat noch 1.200 € Lohn von seinem Arbeitgeber W offen. Er will das Geld von W’s Mutter M. Außerdem fragt er, ob er gegen jeden vorgehen kann, der seine Ehre verletzt. Was trifft zu?",
    choices: [
      { id: "a", text: "M schuldet den Lohn mit, weil sie Angehörige des Arbeitgebers ist." },
      { id: "b", text: "Lohn und Ehre wirken beide nur zwischen den Vertragsparteien." },
      { id: "c", text: "Der Lohnanspruch wirkt nur gegen W. Die Ehre ist gegenüber jedermann geschützt." },
      { id: "d", text: "Beides sind absolute Rechte, K kann sich also an M und an jeden Dritten halten." },
    ],
    answer: "c",
    explanation:
      "Der Lohn ist ein relatives Recht aus dem Arbeitsvertrag und wirkt nur zwischen K und W. Die Ehre ist ein absolutes Persönlichkeitsrecht. K kann sich an jede Person halten, die sie verletzt, etwa auf Unterlassung, Widerruf oder Schadenersatz (§ 1330 ABGB).",
  },
  {
    id: "q03",
    chapterId: "1",
    points: 4,
    prompt:
      "Angestellte A unterschreibt einen Arbeitsvertrag mit 20 Werktagen Urlaub und ist ausdrücklich einverstanden. Nach einem Jahr verlangt sie 30 Werktage. Zu Recht?",
    choices: [
      { id: "a", text: "Nein. Sie hat zugestimmt, der Vertrag gilt so, wie er geschlossen wurde." },
      { id: "b", text: "Ja. § 2 UrlG gewährt mindestens 30 Werktage und ist relativ zwingend." },
      { id: "c", text: "Nur zur Hälfte: Es bleiben 25 Werktage als Kompromiss." },
      { id: "d", text: "Ja, aber nur, wenn der Arbeitgeber Unternehmer im Sinn des KSchG ist." },
    ],
    answer: "b",
    explanation:
      "Mindestens 30 Werktage (fünf Wochen) pro Arbeitsjahr sind relativ zwingend. Die Vereinbarung von 20 Tagen unterschreitet das Minimum und ist insoweit unwirksam, auch wenn A zugestimmt hat.",
  },
  {
    id: "q04",
    chapterId: "1",
    points: 4,
    prompt:
      "Eine jüngere Verordnung widerspricht einem älteren Gesetz. Welche Norm geht vor?",
    choices: [
      { id: "a", text: "Die Verordnung, weil die spätere Regel die frühere verdrängt." },
      { id: "b", text: "Das ältere Gesetz. Der Stufenbau geht dem zeitlichen Vorrang vor." },
      { id: "c", text: "Immer die Norm, die für den Bürger günstiger ist." },
      { id: "d", text: "Keine von beiden. Es entsteht eine planwidrige Lücke." },
    ],
    answer: "b",
    explanation:
      "Lex posterior gilt nur zwischen gleichrangigen Normen. Eine Verordnung steht unter dem Gesetz. Die jüngere Verordnung verdrängt das ältere Gesetz nicht.",
  },
  {
    id: "q05",
    chapterId: "3",
    points: 4,
    prompt:
      "Der sechsjährige Max kauft mit seinem Taschengeld ein Eis um 2,50 € und zahlt sofort. Eine Woche später kauft er mit 350 € aus der Schreibtischlade seines Vaters eine Spielkonsole. Was gilt?",
    choices: [
      { id: "a", text: "Beide Verträge sind unwirksam, weil Max noch nicht sieben ist." },
      { id: "b", text: "Beide Verträge sind wirksam, weil ein Preis genannt und gezahlt wurde." },
      { id: "c", text: "Das Eis ist mit der Zahlung wirksam. Die Konsole ist unwirksam." },
      { id: "d", text: "Das Eis ist unwirksam, die Konsole ist schwebend unwirksam und kann genehmigt werden." },
    ],
    answer: "c",
    explanation:
      "Das Eis ist ein geringfügiges, altersübliches Geschäft und wurde sofort erfüllt (§ 170 Abs 3 ABGB). Die Konsole ist weder geringfügig noch altersüblich und wurde nicht mit dem dafür überlassenen Geld bezahlt. Sie ist unwirksam, die Leistungen sind zurückzugeben.",
  },
  {
    id: "q06",
    chapterId: "3",
    points: 4,
    prompt: "Ab wann ist ein Mensch deliktsfähig?",
    choices: [
      { id: "a", text: "Ab der Geburt, zusammen mit der Rechtsfähigkeit." },
      { id: "b", text: "Ab dem vollendeten 7. Lebensjahr." },
      { id: "c", text: "Ab dem vollendeten 14. Lebensjahr." },
      { id: "d", text: "Erst mit der Volljährigkeit, also ab 18." },
    ],
    answer: "c",
    explanation:
      "Deliktsfähig ist man ab 14 (§ 176 ABGB). Darunter haftet bei einer Aufsichtspflichtverletzung die Aufsichtsperson (§ 1309); ausnahmsweise kommt eine Billigkeitshaftung (§ 1310) in Betracht. Rechtsfähigkeit beginnt dagegen schon mit der Lebendgeburt.",
  },
  {
    id: "q07",
    chapterId: "3",
    points: 4,
    prompt: "Welche Aussage zur Rechtsfähigkeit trifft zu?",
    choices: [
      { id: "a", text: "Rechtsfähig ist nur, wer auch Geschäfte selbst schließen kann." },
      { id: "b", text: "Jeder Mensch ist ab der Lebendgeburt rechtsfähig. Der nasciturus ist es bedingt schon ab der Zeugung." },
      { id: "c", text: "Juristische Personen werden rechtsfähig, sobald sie einen Namen führen, eine Eintragung ist entbehrlich." },
      { id: "d", text: "Rechtsfähigkeit und Deliktsfähigkeit beginnen am selben Tag." },
    ],
    answer: "b",
    explanation:
      "Rechtsfähig ist jeder Mensch ab der Lebendgeburt, der nasciturus bedingt schon ab der Zeugung (§ 22 ABGB), außerdem jede juristische Person. Ein Baby kann daher Eigentümer sein, ohne geschäftsfähig zu sein.",
  },
  {
    id: "q08",
    chapterId: "4",
    points: 4,
    prompt:
      "Einkäuferin E hat Vollmacht, für die Firma Büromaterial zu kaufen. Intern soll sie diesen Monat nichts mehr bestellen. Sie bestellt trotzdem Papier um 300 €. Was gilt?",
    choices: [
      { id: "a", text: "Der Vertrag ist unwirksam, weil E gegen eine Weisung verstoßen hat." },
      { id: "b", text: "Nur E selbst wird Vertragspartnerin, die Firma bleibt außen vor." },
      { id: "c", text: "Die Firma ist gebunden. E haftet im Innenverhältnis für einen allfälligen Schaden." },
      { id: "d", text: "Die Firma kann den Kauf wegen Irrtums über die Weisung anfechten." },
    ],
    answer: "c",
    explanation:
      "Vollmacht und Auftrag sind zu trennen. Die Vollmacht sagt, was E im Außenverhältnis kann: Die Firma ist gebunden. Der Auftrag sagt, was sie darf: Intern hat sie die Weisung verletzt und kann für den Schaden haften.",
  },
  {
    id: "q09",
    chapterId: "6",
    points: 4,
    prompt: "Wie lange ist ein Angebot unter Abwesenden bindend, wenn der Anbietende keine Frist setzt?",
    choices: [
      { id: "a", text: "Gar nicht. Unter Abwesenden erlischt das Angebot mit der Absendung." },
      { id: "b", text: "Starr 30 Tage ab Absendung." },
      { id: "c", text: "Ab Zugang, für eine angemessene Überlegungsfrist (§ 862 ABGB)." },
      { id: "d", text: "Bis der Empfänger ausdrücklich ablehnt, ohne zeitliche Grenze." },
    ],
    answer: "c",
    explanation:
      "Unter Abwesenden bindet das Angebot ab Zugang für eine angemessene Überlegungsfrist, wenn der Anbietende keine eigene Frist setzt (§ 862 ABGB).",
  },
  {
    id: "q10",
    chapterId: "8",
    points: 4,
    prompt: "Welche Vierteilung der Leistungsstörungen verwendet der Grundkurs?",
    choices: [
      { id: "a", text: "Unmöglichkeit, Verzug, Gewährleistung und positive Vertragsverletzung." },
      { id: "b", text: "Irrtum, List, Drohung und Scherz." },
      { id: "c", text: "Kauf, Tausch, Schenkung und Leihe." },
      { id: "d", text: "Verzug, Bereicherung, GoA und Schadenersatz." },
    ],
    answer: "a",
    explanation:
      "Der Grundkurs ordnet so: Unmöglichkeit (gar nicht), Verzug (zu spät), Gewährleistung (schlecht) und positive Vertragsverletzung (Nebenpflicht). Irrtum und List sind Willensmängel, keine Leistungsstörungen.",
  },
  {
    id: "q11",
    chapterId: "8",
    points: 4,
    prompt: "Was kennzeichnet die Gewährleistung?",
    choices: [
      { id: "a", text: "Sie setzt Verschulden voraus und verjährt in drei Jahren ab Kenntnis." },
      { id: "b", text: "Sie ist verschuldensunabhängig. Primär Verbesserung oder Austausch, sekundär Preisminderung oder Wandlung. Frist: 2 Jahre bei beweglichen, 3 Jahre bei unbeweglichen Sachen." },
      { id: "c", text: "Sie ersetzt eine vereinbarte Garantie und schließt Schadenersatz aus." },
      { id: "d", text: "Sie gilt nur zwischen Unternehmern und dauert immer 6 Monate." },
    ],
    answer: "b",
    explanation:
      "Gewährleistung trifft den Vertragspartner ohne Verschulden. Zuerst ist zu verbessern oder auszutauschen, danach kann gemindert oder gewandelt werden. Die Frist beträgt 2 Jahre (beweglich) und 3 Jahre (unbeweglich), jeweils plus drei Monate. Eine Garantie ersetzt die Gewährleistung nicht. Mangelfolgeschäden laufen über den Schadenersatz.",
  },
  {
    id: "q12",
    chapterId: "8",
    points: 4,
    prompt: "Es wurde ein Fixgeschäft geschlossen und der Schuldner liefert zu spät. Was gilt?",
    choices: [
      { id: "a", text: "Der Gläubiger muss zuerst eine angemessene Nachfrist setzen (§ 918 ABGB)." },
      { id: "b", text: "Der Gläubiger kann ohne Nachfrist zurücktreten (§ 919 ABGB)." },
      { id: "c", text: "Der Vertrag ist von selbst nichtig, ein Rücktritt ist überflüssig." },
      { id: "d", text: "Es bleibt nur ein Anspruch auf Preisminderung, kein Rücktritt." },
    ],
    answer: "b",
    explanation:
      "Beim gewöhnlichen Schuldnerverzug braucht der Rücktritt eine angemessene Nachfrist (§ 918 ABGB). Beim Fixgeschäft entfällt diese Nachfrist (§ 919 ABGB).",
  },
  {
    id: "q13",
    chapterId: "14",
    points: 4,
    prompt:
      "Ein Grazer Händler und eine slowenische GmbH schließen einen Laptopkauf. Der Vertrag sagt nur: „Es gilt österreichisches Recht.“ Gilt das UN-Kaufrecht?",
    choices: [
      { id: "a", text: "Nein. Die Wahl österreichischen Rechts verdrängt das CISG immer." },
      { id: "b", text: "Ja. Das CISG ist Teil des österreichischen Rechts und ist hier nicht ausdrücklich abgewählt." },
      { id: "c", text: "Nein. Das CISG gilt nur, wenn beide Parteien in demselben Staat sitzen." },
      { id: "d", text: "Ja, aber nur für den privaten Gebrauch der Laptops." },
    ],
    answer: "b",
    explanation:
      "Warenkauf zwischen Niederlassungen in verschiedenen Vertragsstaaten fällt grundsätzlich unter das CISG. „Es gilt österreichisches Recht“ schließt es nicht aus, weil das CISG Teil des österreichischen Rechts ist. Nötig ist ein ausdrücklicher oder eindeutig schlüssiger Ausschluss (Art 6 CISG).",
  },
  {
    id: "q14",
    chapterId: "5",
    points: 4,
    prompt: "Binnen welcher Frist ist die Besitzstörungsklage zu erheben?",
    choices: [
      { id: "a", text: "30 Tage ab Kenntnis von Störung und Störer (§ 454 ZPO)." },
      { id: "b", text: "3 Jahre ab der Störung (§ 1489 ABGB)." },
      { id: "c", text: "6 Monate ab Übergabe der Sache." },
      { id: "d", text: "Es gibt keine Frist, solange der Besitz andauert." },
    ],
    answer: "a",
    explanation:
      "Die Besitzstörungsklage ist binnen 30 Tagen ab Kenntnis von Störung und Störer zu erheben (§ 454 ZPO).",
  },
  {
    id: "q15",
    chapterId: "1",
    points: 4,
    prompt: "Wie wirken EU-Verordnung und EU-Richtlinie in Österreich?",
    choices: [
      { id: "a", text: "Beide gelten erst, wenn der Nationalrat sie als Gesetz beschließt." },
      { id: "b", text: "Die Verordnung gilt unmittelbar. Die Richtlinie muss umgesetzt werden." },
      { id: "c", text: "Die Richtlinie gilt unmittelbar, die Verordnung nur als Empfehlung." },
      { id: "d", text: "Keines von beiden geht einem älteren österreichischen Gesetz vor." },
    ],
    answer: "b",
    explanation:
      "Verordnungen gelten unmittelbar. Richtlinien müssen umgesetzt werden. Unionsrecht hat Anwendungsvorrang.",
  },
  {
    id: "q16",
    chapterId: "8",
    points: 4,
    prompt: "Ein Mangel verursacht einen weiteren Schaden an anderen Sachen des Käufers. Worüber läuft dieser Mangelfolgeschaden?",
    choices: [
      { id: "a", text: "Über die Gewährleistung, weil jeder Mangelschaden verschuldensunabhängig ersetzt wird." },
      { id: "b", text: "Über den Schadenersatz. Das Verschulden wird zehn Jahre lang vermutet (§ 933a ABGB)." },
      { id: "c", text: "Über die Bereicherung, weil der Verkäufer den Kaufpreis ohne Rechtsgrund behält." },
      { id: "d", text: "Gar nicht. Folgeschäden sind vertraglich ausgeschlossen, sobald Gewährleistung besteht." },
    ],
    answer: "b",
    explanation:
      "Die Gewährleistung betrifft den Mangel der Sache selbst. Der Mangelfolgeschaden läuft über den Schadenersatz. Das Verschulden wird zehn Jahre lang vermutet (§ 933a ABGB).",
  },
];

export const papers = {
  A: {
    id: "A" as const,
    title: "Probeklausur",
    minutes: 60,
    questionIds: ["q01", "q02", "q03", "q04", "q05", "q06", "q07", "q08", "q09", "q10", "q11", "q12"],
  },
  B: {
    id: "B" as const,
    title: "Zweite Klausur",
    minutes: 60,
    questionIds: ["q05", "q06", "q08", "q09", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q04"],
  },
};

export type PaperId = keyof typeof papers;

export function questionsFor(paper: PaperId) {
  const wanted = new Set(papers[paper].questionIds);
  const ordered = papers[paper].questionIds
    .map((id) => questions.find((question) => question.id === id))
    .filter((question): question is ExamQuestion => Boolean(question));
  if (ordered.length !== wanted.size) {
    throw new Error("Klausurfragen unvollständig");
  }
  return ordered;
}

export function maxPoints(paper: PaperId) {
  return questionsFor(paper).reduce((sum, question) => sum + question.points, 0);
}
