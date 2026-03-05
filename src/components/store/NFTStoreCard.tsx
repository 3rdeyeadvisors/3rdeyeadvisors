import { useReadContract } from "thirdweb/react";
import { getNFTContract, NFT_CONTRACT_ADDRESS } from "@/lib/thirdweb";
import { getActiveClaimCondition, totalSupply } from "thirdweb/extensions/erc1155";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Coins, Package, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import nftImage from "@/assets/nft/3ea-earth-access.png";

// Token ID for the Sentinel DeFi Access NFT (first token in the ERC1155 collection)
const ACCESS_TOKEN_ID = 0n;

// Fallback values when blockchain data can't be fetched
const FALLBACK_PRICE = "0.01 ETH";
const FALLBACK_SUPPLY = "Limited";

// Thirdweb hosted checkout URL for the NFT
const THIRDWEB_CHECKOUT_URL = "https://thirdweb.com/ethereum/0x91AE8ec3d88E871679F826c1D6c5B008f105506c";

// Helper to format wei to ETH
const formatEther = (wei: bigint): string => {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(eth < 0.01 ? 4 : 2);
};

export const NFTStoreCard = () => {
  const contract = getNFTContract();

  // Fetch active claim condition (includes price)
  const { data: claimCondition, isLoading: loadingCondition, error: conditionError } = useReadContract(
    getActiveClaimCondition,
    {
      contract,
      tokenId: ACCESS_TOKEN_ID,
    }
  );

  // Fetch total minted supply
  const { data: minted, isLoading: loadingSupply, error: supplyError } = useReadContract(
    totalSupply,
    {
      contract,
      id: ACCESS_TOKEN_ID,
    }
  );

  const isLoading = loadingCondition || loadingSupply;
  const hasDataError = conditionError || supplyError;
  
  const pricePerToken = claimCondition?.pricePerToken;
  const maxClaimableSupply = claimCondition?.maxClaimableSupply;
  const mintedCount = minted ? Number(minted) : 0;
  const maxSupply = maxClaimableSupply ? Number(maxClaimableSupply) : null;
  const remaining = maxSupply ? maxSupply - mintedCount : null;

  // Format price for display - always use fallback if no valid price
  const formattedPrice = pricePerToken && pricePerToken > 0n
    ? `${formatEther(pricePerToken)} ETH` 
    : FALLBACK_PRICE;
  
  // Format supply for display
  const formattedSupply = hasDataError 
    ? FALLBACK_SUPPLY 
    : (maxSupply 
        ? `${remaining?.toLocaleString()} left` 
        : `${mintedCount.toLocaleString()} minted`);

  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group flex flex-col h-full">
      {/* NFT Image */}
      <div className="aspect-square relative bg-black overflow-hidden">
        <img 
          src={nftImage} 
          alt="Sentinel Earth Access NFT"
          loading="lazy"
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {hasDataError && (
          <Badge variant="outline" className="absolute top-2 left-2 text-[10px] bg-black/80 text-white/50 border-white/10">
            <AlertCircle className="w-3 h-3 mr-1" />
            Offline Data
          </Badge>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-consciousness text-base font-bold text-white group-hover:text-violet-300 transition-colors">
            Sentinel Earth Access NFT
          </h3>
          <p className="font-body text-xs text-white/40 mt-1 uppercase tracking-widest">
            Vault Membership Key
          </p>
        </div>

        {/* Price & Supply Info - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
            <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Price</p>
            {isLoading && !hasDataError ? (
              <Loader2 className="h-3 w-3 animate-spin mx-auto text-violet-400" />
            ) : (
              <p className="font-consciousness text-sm font-bold text-white truncate">{formattedPrice}</p>
            )}
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
            <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Supply</p>
            {isLoading && !hasDataError ? (
              <Loader2 className="h-3 w-3 animate-spin mx-auto text-violet-400" />
            ) : (
              <p className="font-consciousness text-sm font-bold text-white truncate">{formattedSupply}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-8">
          {[
            "Enzyme Vault access",
            "Managed DeFi strategies",
            "On-chain verification"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-body text-xs text-white/60">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Buy Now Button - Direct Link to Thirdweb */}
        <div className="mt-auto space-y-4">
          <Button 
            asChild 
            className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white py-6 rounded-xl text-sm transition-all"
          >
            <a 
              href={THIRDWEB_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy on Thirdweb
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>

          <a 
            href={`https://etherscan.io/address/${NFT_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[10px] text-white/40 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
          >
            <ExternalLink className="h-3 w-3" />
            View Contract
          </a>
        </div>
      </div>
    </div>
  );
};

export default NFTStoreCard;
