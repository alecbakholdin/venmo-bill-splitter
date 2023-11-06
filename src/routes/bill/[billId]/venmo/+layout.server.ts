import { getBill } from "../__route/utils.server";

export async function load({request, params, locals}) {
    const bill = (await getBill(params.billId, locals)).data();

    return {
        bill
    }
}