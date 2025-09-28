export type BlockType = "Bush" | "Tree" | "Stone" | "House" | "Square" | "Swamp" | "Water" | "Nothing";

const texts: Record<BlockType, string[]> = {
    Bush: [
        "Ein dichter Busch versperrt die Sicht.",
        "Zu viel Gestrüpp, um einfach durchzugehen.",
        "Mit dem richtigen Werkzeug könnte man ihn entfernen.",
    ],
    Tree: [
        "Ein kräftiger Baum blockiert den Weg.",
        "Der Stamm ist zu dick, um vorbeizukommen.",
        "Vielleicht kannst du ihn später fällen.",
    ],
    Stone: [
        "Ein großer Stein blockiert den Weg.",
        "Zu schwer, um ihn mit bloßen Händen zu bewegen.",
        "Vielleicht kannst du ihn irgendwann zertrümmern.",
    ],
    House: [
        "Ein Haus steht hier, du kannst nicht hindurch.",
        "Die Tür ist verschlossen. Kein Durchgang.",
        "Hier geht es nicht weiter.",
    ],
    Square: [
        "Etwas blockiert den Weg.",
        "Hier kannst du nicht weitergehen.",
        "Kein Durchkommen möglich.",
    ],
    Swamp: [
        "Der Sumpf ist zu tief und gefährlich.",
        "Die matschige Erde verschlingt deine Schritte.",
        "Du brauchst etwas, um hier sicher durchzukommen.",
    ],
    Water: [
        "Das Wasser ist zu tief, um hindurchzugehen.",
        "Ohne Boot kommst du hier nicht weiter.",
        "Die Strömung ist zu stark.",
    ],
    Nothing: [
        "Hier scheint etwas den Weg zu blockieren.",
        "Du kannst diesen Bereich nicht betreten.",
        "Eine unsichtbare Barriere hält dich zurück.",
    ],
};

// Merkt sich den aktuellen Index je Typ
const textIndices: Record<BlockType, number> = {
    Bush: 0,
    Tree: 0,
    Stone: 0,
    House: 0,
    Square: 0,
    Swamp: 0,
    Water: 0,
    Nothing: 0,
};

export function getNextText(type: BlockType): string {
    const options = texts[type];
    if (!options || options.length === 0) return "";

    const index = textIndices[type];
    const text = options[index];

    // Index hochzählen, bei Ende zurücksetzen
    textIndices[type] = (index + 1) % options.length;

    return text as string;
}

export function getRandomText(type: BlockType): string {
    const options = texts[type];
    return options[Math.floor(Math.random() * options.length)] as string;
}
