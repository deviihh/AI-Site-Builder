export const SAMPLE_SITE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Figtree:wght@400;600&display=swap" rel="stylesheet">
<style>body{font-family:'Figtree',sans-serif}.serif{font-family:'Fraunces',serif}</style>
</head>
<body class="bg-[#1d2810] text-[#fefae0]">
<div class="bg-[#606c38] py-2 text-center text-sm">Free delivery on orders above ₹999. Easy 30-day returns.</div>
<header class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-4">
  <span class="serif text-3xl font-semibold">MyCart</span>
  <nav class="flex gap-6 text-sm font-semibold text-[#cfcaa4]"><a href="#">Men</a><a href="#">Women</a><a href="#">Kids</a><a href="#">Home</a><a href="#">Beauty</a></nav>
  <div class="max-w-xs flex-1 rounded-full bg-[#34461f] px-4 py-2 text-sm text-[#cfcaa4]">Search for shirts, dresses and more</div>
  <div class="flex items-center gap-4 text-sm"><a href="#" class="text-[#cfcaa4]">Wishlist</a><a href="#" class="rounded-full bg-[#dda15e] px-5 py-2 font-semibold text-[#283618]">Bag (2)</a></div>
</header>
<main class="mx-auto grid max-w-6xl grid-cols-2 items-center gap-12 px-8 pb-10 pt-5">
  <section>
    <p class="mb-5 inline-block rounded-full bg-[#34461f] px-4 py-1.5 text-sm">End of season sale</p>
    <h1 class="serif text-[60px] font-semibold leading-[1.04]">Dress the whole family for less.</h1>
    <p class="mt-6 max-w-md text-lg text-[#cfcaa4]">Shirts, dresses, frocks and tees from independent labels, with up to 60% off this week.</p>
    <div class="mt-8 flex gap-3">
      <a href="#" class="rounded-full bg-[#dda15e] px-7 py-3.5 font-semibold text-[#283618]">Shop now</a>
      <a href="#" class="rounded-full bg-[#34461f] px-7 py-3.5 font-semibold">Explore kids</a>
    </div>
    <div class="mt-10 grid grid-cols-3 gap-6 border-t border-[#fefae0]/20 pt-6 text-sm">
      <div><p class="serif text-xl font-semibold">30 days</p><p class="text-[#cfcaa4]">easy returns</p></div>
      <div><p class="serif text-xl font-semibold">Pay on delivery</p><p class="text-[#cfcaa4]">on most orders</p></div>
      <div><p class="serif text-xl font-semibold">Secure</p><p class="text-[#cfcaa4]">checkout</p></div>
    </div>
  </section>

  <section class="grid grid-cols-2 gap-x-4 gap-y-5">
    <article>
      <div class="relative h-48 overflow-hidden rounded-[22px] bg-[#606c38]">
        <span class="absolute left-3 top-3 z-10 rounded-full bg-[#fefae0] px-3 py-1 text-xs font-semibold text-[#283618]">Women</span>
        <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet" class="h-full w-full">
          <circle cx="100" cy="118" r="82" fill="#fefae0" opacity="0.12"/>
          <path d="M76 74 L60 124" stroke="#d9a071" stroke-width="9" stroke-linecap="round"/>
          <path d="M124 74 L140 124" stroke="#d9a071" stroke-width="9" stroke-linecap="round"/>
          <rect x="88" y="186" width="9" height="26" rx="4" fill="#d9a071"/>
          <rect x="103" y="186" width="9" height="26" rx="4" fill="#d9a071"/>
          <ellipse cx="90" cy="214" rx="9" ry="4" fill="#283618"/>
          <ellipse cx="110" cy="214" rx="9" ry="4" fill="#283618"/>
          <path d="M78 72 L122 72 L116 108 L148 190 L52 190 L84 108 Z" fill="#fefae0"/>
          <rect x="84" y="105" width="32" height="6" rx="3" fill="#dda15e"/>
          <circle cx="78" cy="160" r="3" fill="#bc6c25"/>
          <circle cx="100" cy="174" r="3" fill="#bc6c25"/>
          <circle cx="122" cy="158" r="3" fill="#bc6c25"/>
          <circle cx="92" cy="140" r="3" fill="#bc6c25"/>
          <ellipse cx="100" cy="46" rx="21" ry="25" fill="#2b1a10"/>
          <rect x="94" y="58" width="12" height="16" rx="5" fill="#d9a071"/>
          <circle cx="100" cy="44" r="16" fill="#d9a071"/>
          <path d="M84 42 C86 26 114 26 116 42 C110 34 90 34 84 42 Z" fill="#2b1a10"/>
          <path d="M90 72 Q100 82 110 72 Z" fill="#d9a071"/>
        </svg>
      </div>
      <div class="mt-3">
        <p class="font-semibold">Meadow wrap dress</p>
        <p class="text-sm text-[#cfcaa4]">Sleeveless, cotton blend</p>
        <p class="mt-1 text-sm"><span class="font-semibold">₹1,199</span> <s class="text-[#cfcaa4]">₹2,499</s> <span class="font-semibold text-[#dda15e]">52% OFF</span></p>
      </div>
    </article>

    <article>
      <div class="relative h-48 overflow-hidden rounded-[22px] bg-[#dda15e]">
        <span class="absolute left-3 top-3 z-10 rounded-full bg-[#283618] px-3 py-1 text-xs font-semibold text-[#fefae0]">Men</span>
        <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet" class="h-full w-full">
          <circle cx="100" cy="120" r="82" fill="#fefae0" opacity="0.2"/>
          <path d="M68 130 L132 130 L128 204 L105 204 L100 152 L95 204 L72 204 Z" fill="#283618"/>
          <rect x="68" y="130" width="64" height="7" fill="#1d2810"/>
          <ellipse cx="83" cy="208" rx="13" ry="5" fill="#1a1410"/>
          <ellipse cx="117" cy="208" rx="13" ry="5" fill="#1a1410"/>
          <path d="M74 76 L58 124" stroke="#fefae0" stroke-width="15" stroke-linecap="round"/>
          <path d="M126 76 L142 124" stroke="#fefae0" stroke-width="15" stroke-linecap="round"/>
          <circle cx="56" cy="131" r="6.5" fill="#8d5a3b"/>
          <circle cx="144" cy="131" r="6.5" fill="#8d5a3b"/>
          <path d="M72 70 Q100 62 128 70 L132 136 L68 136 Z" fill="#fefae0"/>
          <path d="M92 66 L100 80 L108 66 Z" fill="#8d5a3b"/>
          <circle cx="100" cy="94" r="1.8" fill="#283618"/>
          <circle cx="100" cy="108" r="1.8" fill="#283618"/>
          <circle cx="100" cy="122" r="1.8" fill="#283618"/>
          <rect x="94" y="52" width="12" height="16" rx="5" fill="#8d5a3b"/>
          <circle cx="100" cy="40" r="16" fill="#8d5a3b"/>
          <path d="M84 38 C84 20 116 20 116 38 C112 30 88 30 84 38 Z" fill="#1a1410"/>
        </svg>
      </div>
      <div class="mt-3">
        <p class="font-semibold">Linen shirt and trousers</p>
        <p class="text-sm text-[#cfcaa4]">Regular fit, two-piece set</p>
        <p class="mt-1 text-sm"><span class="font-semibold">₹1,599</span> <s class="text-[#cfcaa4]">₹2,499</s> <span class="font-semibold text-[#dda15e]">36% OFF</span></p>
      </div>
    </article>

    <article>
      <div class="relative h-48 overflow-hidden rounded-[22px] bg-[#bc6c25]">
        <span class="absolute left-3 top-3 z-10 rounded-full bg-[#fefae0] px-3 py-1 text-xs font-semibold text-[#283618]">Girls</span>
        <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet" class="h-full w-full">
          <circle cx="100" cy="130" r="72" fill="#fefae0" opacity="0.15"/>
          <rect x="88" y="176" width="8" height="28" rx="4" fill="#f0c8a0"/>
          <rect x="104" y="176" width="8" height="28" rx="4" fill="#f0c8a0"/>
          <rect x="87" y="194" width="10" height="9" rx="3" fill="#fefae0"/>
          <rect x="103" y="194" width="10" height="9" rx="3" fill="#fefae0"/>
          <ellipse cx="90" cy="207" rx="10" ry="4.5" fill="#283618"/>
          <ellipse cx="110" cy="207" rx="10" ry="4.5" fill="#283618"/>
          <path d="M82 112 L69 146" stroke="#f0c8a0" stroke-width="8" stroke-linecap="round"/>
          <path d="M118 112 L131 146" stroke="#f0c8a0" stroke-width="8" stroke-linecap="round"/>
          <path d="M84 106 L116 106 L114 130 L142 180 L58 180 L86 130 Z" fill="#fefae0"/>
          <rect x="85" y="127" width="30" height="6" rx="3" fill="#606c38"/>
          <circle cx="82" cy="111" r="7" fill="#fefae0"/>
          <circle cx="118" cy="111" r="7" fill="#fefae0"/>
          <circle cx="80" cy="166" r="3" fill="#bc6c25"/>
          <circle cx="98" cy="154" r="3" fill="#bc6c25"/>
          <circle cx="118" cy="168" r="3" fill="#bc6c25"/>
          <circle cx="122" cy="156" r="3" fill="#bc6c25"/>
          <circle cx="78" cy="80" r="8" fill="#4a2c17"/>
          <circle cx="122" cy="80" r="8" fill="#4a2c17"/>
          <ellipse cx="100" cy="82" rx="19" ry="20" fill="#4a2c17"/>
          <rect x="95" y="96" width="10" height="12" rx="4" fill="#f0c8a0"/>
          <circle cx="100" cy="86" r="16" fill="#f0c8a0"/>
          <path d="M85 82 C86 68 114 68 115 82 C108 76 92 76 85 82 Z" fill="#4a2c17"/>
          <circle cx="79" cy="73" r="3" fill="#dda15e"/>
          <circle cx="121" cy="73" r="3" fill="#dda15e"/>
        </svg>
      </div>
      <div class="mt-3">
        <p class="font-semibold">Polka party frock</p>
        <p class="text-sm text-[#cfcaa4]">Soft cotton, ages 3 to 8</p>
        <p class="mt-1 text-sm"><span class="font-semibold">₹899</span> <s class="text-[#cfcaa4]">₹1,499</s> <span class="font-semibold text-[#dda15e]">40% OFF</span></p>
      </div>
    </article>

    <article>
      <div class="relative h-48 overflow-hidden rounded-[22px] bg-[#34461f]">
        <span class="absolute left-3 top-3 z-10 rounded-full bg-[#dda15e] px-3 py-1 text-xs font-semibold text-[#283618]">Boys</span>
        <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet" class="h-full w-full">
          <circle cx="100" cy="130" r="72" fill="#fefae0" opacity="0.1"/>
          <rect x="80" y="176" width="10" height="24" rx="4" fill="#c68642"/>
          <rect x="110" y="176" width="10" height="24" rx="4" fill="#c68642"/>
          <rect x="79" y="192" width="12" height="9" rx="3" fill="#fefae0"/>
          <rect x="109" y="192" width="12" height="9" rx="3" fill="#fefae0"/>
          <ellipse cx="84" cy="206" rx="12" ry="5" fill="#bc6c25"/>
          <ellipse cx="116" cy="206" rx="12" ry="5" fill="#bc6c25"/>
          <path d="M66 126 L60 152" stroke="#c68642" stroke-width="8" stroke-linecap="round"/>
          <path d="M134 126 L140 152" stroke="#c68642" stroke-width="8" stroke-linecap="round"/>
          <path d="M75 150 L125 150 L128 180 L104 180 L100 166 L96 180 L72 180 Z" fill="#fefae0"/>
          <path d="M76 108 L124 108 L126 152 L74 152 Z" fill="#dda15e"/>
          <path d="M76 108 L60 124 L68 134 L78 124 Z" fill="#dda15e"/>
          <path d="M124 108 L140 124 L132 134 L122 124 Z" fill="#dda15e"/>
          <circle cx="100" cy="130" r="9" fill="#283618"/>
          <circle cx="100" cy="130" r="4" fill="#fefae0"/>
          <rect x="95" y="96" width="10" height="14" rx="4" fill="#c68642"/>
          <circle cx="100" cy="84" r="16" fill="#c68642"/>
          <path d="M84 82 C84 64 116 64 116 82 C112 74 88 74 84 82 Z" fill="#2b1a10"/>
        </svg>
      </div>
      <div class="mt-3">
        <p class="font-semibold">Graphic tee and shorts</p>
        <p class="text-sm text-[#cfcaa4]">Two-piece set, ages 4 to 10</p>
        <p class="mt-1 text-sm"><span class="font-semibold">₹499</span> <s class="text-[#cfcaa4]">₹999</s> <span class="font-semibold text-[#dda15e]">50% OFF</span></p>
      </div>
    </article>
  </section>
</main>
</body>
</html>`;