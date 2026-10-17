/** world-streams@1: fold a safe monotonic identity into a bounded32-bit RNG seed. */
export function deriveStreams(seed:number,id:number){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||!Number.isSafeInteger(id)||id<1)throw Error('Invalid world seed or organism identity.');
 return {placement:(seed^0x5bd1e995)>>>0,environment:seed,reproduction:(seed^0xa341316c)>>>0,exploration:(seed^0xc8013ea4^Math.imul(id>>>0,0x9e3779b9)^Math.imul(Math.floor(id/4294967296),0x85ebca6b))>>>0};
}
