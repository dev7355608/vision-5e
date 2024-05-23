export default class extends DetectionMode {

    /** @override */
    static defineSchema() {
        return Object.assign(
            super.defineSchema(),
            {
                imprecise: new foundry.data.fields.BooleanField(),
                important: new foundry.data.fields.BooleanField(),
                priority: new foundry.data.fields.NumberField({ nullable: false, initial: 0, required: true })
            }
        );
    }
}
