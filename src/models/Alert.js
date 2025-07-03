import mongoose from 'mongoose';
    const alertEventSchema = new mongoose.Schema({
        type: { type: String, required: true },
        location: { type: String, required: true },
        startedAt: { type: Date, required: true },
        clearedAt: { type: Date, default: null },
        rawText: { type: String },
        sourceId: { type: String },
        status: { type: String, enum: ['active', 'cleared'], default: 'active' }
    }, { timestamps: true });

    export const AlertEventModel = mongoose.model('AlertEvent', alertEventSchema);

    export class Alert {
    constructor({ id, type, location, startedAt, clearedAt = null, rawText, sourceId, status = 'active' }) {
        this.id = id;
        this.type = type;
        this.location = location;
        this.startedAt = startedAt;
        this.clearedAt = clearedAt;
        this.rawText = rawText;
        this.sourceId = sourceId;
        this.status = status;
    }

    async save() {
        if (this.id) {
            const updatedDoc = await AlertEventModel.findByIdAndUpdate(
                this.id,
                {
                    type: this.type,
                    location: this.location,
                    startedAt: this.startedAt,
                    clearedAt: this.clearedAt,
                    rawText: this.rawText,
                    sourceId: this.sourceId,
                    status: this.status,
                },
                { new: true }
            );
            if (updatedDoc) this.id = updatedDoc._id.toString();
            return updatedDoc;
        } else {
            const alertDoc = new AlertEventModel({
                type: this.type,
                location: this.location,
                startedAt: this.startedAt,
                clearedAt: this.clearedAt,
                rawText: this.rawText,
                sourceId: this.sourceId,
                status: this.status,
            });
            const savedDoc = await alertDoc.save();
            this.id = savedDoc._id.toString();
            return savedDoc;
        }
    }

    static async findActive(location, type) {
        const doc = await AlertEventModel.findOne({ location, type, clearedAt: null });
        if (!doc) return null;
        return new Alert({
            id: doc._id.toString(),
            type: doc.type,
            location: doc.location,
            startedAt: doc.startedAt,
            clearedAt: doc.clearedAt,
            rawText: doc.rawText,
            sourceId: doc.sourceId,
            status: doc.status,
        });
    }
}

