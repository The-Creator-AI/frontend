import { ChannelBody, ToClient } from "@The-Creator-AI/fe-be-common";

export const getGatewayListener = <T extends ToClient> (
    channel: T,
    callback: (body: ChannelBody<T>) => void
) => {
    return {
        channel,
        callback: callback as (body: ChannelBody<any>) => void
    }
}