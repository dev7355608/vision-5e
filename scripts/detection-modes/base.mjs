export default class extends foundry.canvas.perception.DetectionMode {
    /** @override */
    static defineSchema() {
        return Object.assign(
            super.defineSchema(),
            {
                imprecise: new foundry.data.fields.BooleanField(),
                important: new foundry.data.fields.BooleanField(),
                sort: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0 }),
            },
        );
    }
}
