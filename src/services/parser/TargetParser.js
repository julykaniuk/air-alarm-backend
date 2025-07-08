import { Target } from "./../../models/Target.js";
import { v4 as uuidv4 } from "uuid";
import { threatSettings } from "../../constants/threatSettings.js";

function parseLocation(locationLine) {
    const cleanedLine = locationLine.replace(/^[\p{Emoji}\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim();
    let line = cleanedLine.replace(/https?:\/\/\S+/gi, '').trim();

    let words = line.split(/\s+/);

    let district = undefined;
    let region = undefined;
    let territory = undefined;

    function findBeforeKeyword(arr, keywordVariants) {
        for (let i = 1; i < arr.length; i++) {
            for (const keyword of keywordVariants) {
                if (arr[i].toLowerCase().startsWith(keyword.toLowerCase())) {
                    return arr[i - 1] + " " + arr[i];
                }
            }
        }
        return undefined;
    }

    const bracketMatch = locationLine.match(/\(([^)]+)\)/);
    if (bracketMatch) {
        region = bracketMatch[1].trim();
        if (/обл.\.?|область/i.test(region)) {
            region = region.replace(/обл.\.?$/i, "Область");
            line = line.replace(/\([^)]+\)/, '').trim();
            words = line.split(/\s+/);
        } else {
            region = undefined;
        }
    }

    if (!region) {
        region = findBeforeKeyword(words, ["обл.", "область"]);
        if (region) {
            region = region.replace(/обл\.?$/i, "Область");
        }
    }

    if (region) {
        const parts = region.split(/\s+/);
        words = words.filter(w => !parts.includes(w));
    }

    const extraKeywordsToRemove = ["обл.", "область", "район", "територіальна", "громада"];
    words = words.filter(w => !extraKeywordsToRemove.includes(w.toLowerCase()));

    district = findBeforeKeyword(words, ["район"]);
    if (district) {
        const parts = district.split(/\s+/);
        words = words.filter(w => !parts.includes(w));
    }

    territory = findBeforeKeyword(words, ["територіальна громада"]);
    if (territory) {
        const parts = territory.split(/\s+/);
        words = words.filter(w => !parts.includes(w));
    }

    let city = words.join(" ").trim() || undefined;

    const regionLower = region ? region.toLowerCase() : "";
    const cityLower = city ? city.toLowerCase() : "";

    if (
        regionLower.includes("харківщина") ||
        cityLower.includes("харківщина") ||
        !cityLower
    ) {
        city = "м. Харків";
    }

    return {
        city,
        district,
        region,
        territory,
    };
}
function parseRadarLine(line) {
    const countMatch = line.match(/▪️\s*(\d+)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 1;

    const districtMatch = line.match(/в\s+([^\s]+)\s+р-ні/i);
    const district = districtMatch ? districtMatch[1] + " район" : undefined;

    const directionMatch = line.match(/курс на ([^\s⚠️]+)/i);
    const direction = directionMatch ? directionMatch[1] : undefined;

    return { count, district, direction };
}

export function targetMessage(rawText, sourceId) {
    const lines = rawText
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .filter(line => !/^Зверніть увагу, /.test(line) && !/^[-•]/.test(line));

    const targets = [];

    if (lines.length && /^На даний час \d+ БПЛА/i.test(lines[0])) {
        for (let i = 1; i < lines.length; i++) {
            if (!/^\s*▪️/.test(lines[i])) break;

            const { count, district, direction } = parseRadarLine(lines[i]);

            for (let j = 0; j < count; j++) {
                targets.push(new Target({
                    id: uuidv4(),
                    sourceId,
                    type: "загроза застосування бпла",
                    direction,
                    coordinates: undefined,
                    city: undefined,
                    district,
                    territory: undefined,
                    region: "Харківська область",
                    detectedAt: new Date().toISOString(),
                    rawText: lines[i],
                    color: "#FFA500",
                    sound: "dron_alert",
                    code: "UAV",
                }));
            }
        }
        return targets;
    }

    for (let i = 0; i < lines.length; i += 2) {
        const locationLine = lines[i];
        const threatLine = lines[i + 1] ? lines[i + 1].toLowerCase() : "";

        if (!locationLine || !threatLine) continue;

        const { city, district, region, territory } = parseLocation(locationLine);

        let threatType = null;
        let color = null;
        let sound = null;
        let code = null;

        for (const key in threatSettings) {
            const threatInfo = threatSettings[key];
            const keywords = threatInfo.aliases || [key];
            for (const keyword of keywords) {
                if (threatLine.includes(keyword.toLowerCase())) {
                    threatType = key;
                    color = threatInfo.color;
                    sound = threatInfo.sound;
                    code = threatInfo.code;
                    break;
                }
            }
            if (threatType) break;
        }

        if (!threatType) continue;

        const target = new Target({
            id: uuidv4(),
            sourceId,
            type: threatType,
            direction: undefined,
            coordinates: undefined,
            city,
            district,
            territory,
            region,
            detectedAt: new Date().toISOString(),
            rawText: locationLine + "\n" + lines[i + 1],
            color,
            sound,
            code,
        });

        targets.push(target);
    }

    return targets;
}