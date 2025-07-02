export class Target {
    constructor({
                    id,
                    sourceId,
                    type,
                    direction,
                    coordinates,
                    city,
                    district,
                    territory,
                    region,
                    detectedAt,
                    rawText,
                    color,
                    sound,
                    code,
                }) {
        this.id = id;
        this.sourceId = sourceId;
        this.type = type;
        this.direction = direction;
        this.coordinates = coordinates;
        this.city = city;
        this.district = district;
        this.territory = territory;
        this.region = region;
        this.detectedAt = detectedAt;
        this.rawText = rawText;
        this.color = color;
        this.sound = sound;
        this.code = code;
    }
}