import { Target } from "./../../models/Target.js";
import { v4 as uuidv4 } from "uuid";
import {threatSettings} from "../../constants/threatSettings.js";

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
                    return arr[i-1] + " " + arr[i];
                }
            }
        }
        return undefined;
    }

    const bracketMatch = locationLine.match(/\(([^)]+)\)/);
    if (bracketMatch) {
        region = bracketMatch[1].trim();
        if (/обл\.?|область/i.test(region)) {
            region = region.replace(/обл\.?$/i, "Область");
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

    return {
        city: city,
        district: district,
        region: region,
        territory: territory,
    };
}
export function targetMessage(rawText, sourceId) {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const targets = [];

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
