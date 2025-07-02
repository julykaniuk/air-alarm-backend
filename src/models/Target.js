import mongoose from "mongoose";

const TargetSchema = new mongoose.Schema({
    sourceId: { type: String },
    type: { type: String, required: true },
    direction: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    city: { type: String },
    district: { type: String },
    territory: { type: String },
    region: { type: String },
    detectedAt: { type: Date, required: true },
    rawText: { type: String },
    color: { type: String },
    sound: { type: String },
    code: { type: String },
}, {
    timestamps: true,
});

export const TargetModel = mongoose.model("Target", TargetSchema);

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
    async save() {
        const targetDoc = new TargetModel({
            sourceId: this.sourceId,
            type: this.type,
            direction: this.direction,
            coordinates: this.coordinates,
            city: this.city,
            district: this.district,
            territory: this.territory,
            region: this.region,
            detectedAt: this.detectedAt,
            rawText: this.rawText,
            color: this.color,
            sound: this.sound,
            code: this.code,
        });
        const savedDoc = await targetDoc.save();
        this.id = savedDoc._id.toString();
        return savedDoc;
    }
}
