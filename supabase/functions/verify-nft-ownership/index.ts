import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NFT Contract Address
const NFT_CONTRACT_ADDRESS = '0x91AE8ec3d88E871679F826c1D6c5B008f105506c';

// ERC-721 balanceOf ABI encoded function signature
const BALANCE_OF_SELECTOR = '0x70a08231';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress, userId } = await req.json();

    if (!walletAddress || !userId) {
      return new Response(
        JSON.stringify({ error: 'walletAddress and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying NFT ownership for wallet: ${walletAddress}, user: ${userId}`);

    // Get RPC URL from secrets
    const rpcUrl = Deno.env.get('ETHEREUM_RPC_URL');
    if (!rpcUrl) {
      console.error('ETHEREUM_RPC_URL not configured');
      return new Response(
        JSON.stringify({ error: 'RPC configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare balanceOf call data
    // balanceOf(address) - pad address to 32 bytes
    const paddedAddress = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    const callData = BALANCE_OF_SELECTOR + paddedAddress;

    // Call the NFT contract to check balance
    const rpcResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: NFT_CONTRACT_ADDRESS,
            data: callData,
          },
          'latest',
        ],
      }),
    });

    const rpcResult = await rpcResponse.json();
    
    if (rpcResult.error) {
      console.error('RPC error:', rpcResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to verify NFT ownership', details: rpcResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the balance from hex
    const balanceHex = rpcResult.result;
    const balance = parseInt(balanceHex, 16);
    const isOwner = balance > 0;

    console.log(`Wallet ${walletAddress} has ${balance} NFTs. Is owner: ${isOwner}`);

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isOwner) {
      // Upsert to vault_whitelist
      const { error: whitelistError } = await supabase
        .from('vault_whitelist')
        .upsert({
          wallet_address: walletAddress.toLowerCase(),
          user_id: userId,
          nft_balance: balance,
          verified_at: new Date().toISOString(),
          last_verified: new Date().toISOString(),
          is_active: true,
        }, {
          onConflict: 'wallet_address',
        });

      if (whitelistError) {
        console.error('Error updating whitelist:', whitelistError);
        // Don't fail the request, just log
      } else {
        console.log(`Successfully whitelisted wallet: ${walletAddress}`);
      }

      // Log security event
      await supabase.from('security_audit_log').insert({
        event_type: 'nft_verification_success',
        user_id: userId,
        details: {
          wallet_address: walletAddress,
          nft_balance: balance,
          contract: NFT_CONTRACT_ADDRESS,
        },
      });
    } else {
      // Log failed verification attempt
      await supabase.from('security_audit_log').insert({
        event_type: 'nft_verification_failed',
        user_id: userId,
        details: {
          wallet_address: walletAddress,
          nft_balance: 0,
          contract: NFT_CONTRACT_ADDRESS,
        },
      });
    }

    return new Response(
      JSON.stringify({
        isOwner,
        balance,
        walletAddress: walletAddress.toLowerCase(),
        contractAddress: NFT_CONTRACT_ADDRESS,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
