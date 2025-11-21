import type { RawGoodsRecord } from "../mock-goods-types";

import cytokineInjection from "./cytokine-injection";
import ergoSupplement120 from "./ergo-supplement-120";
import ergoSupplement60 from "./ergo-supplement-60";
import exoSkinMask1 from "./exo-skin-mask-1";
import kurepitaD120 from "./kurepita-d-120";
import nadPlus100mg from "./nad-plus-100mg";
import nmnDrip150mg from "./nmn-drip-150mg";
import nmnDrip250mg from "./nmn-drip-250mg";
import nmnNasalSet5 from "./nmn-nasal-set-5";
import nmnSupplement120 from "./nmn-supplement-120";
import nmnSupplement60 from "./nmn-supplement-60";
import wjexo5ml from "./wjexo-5ml";

const mockGoodsItems: RawGoodsRecord[] = [
  nadPlus100mg,
  nmnDrip150mg,
  nmnDrip250mg,
  wjexo5ml,
  cytokineInjection,
  nmnSupplement60,
  nmnSupplement120,
  ergoSupplement60,
  ergoSupplement120,
  nmnNasalSet5,
  exoSkinMask1,
  kurepitaD120,
];

export default mockGoodsItems;
