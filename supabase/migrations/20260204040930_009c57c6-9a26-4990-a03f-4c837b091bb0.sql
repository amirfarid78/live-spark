-- Affiliate links table for creator product promotions
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  link_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  earnings NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate conversions tracking
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  order_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  buyer_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creator shop settings
CREATE TABLE public.creator_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL UNIQUE,
  shop_name TEXT,
  shop_description TEXT,
  shop_banner_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live shopping pinned products
CREATE TABLE public.live_shopping_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  live_session_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC(10,2) NOT NULL,
  discount_percent INTEGER,
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  flash_sale_ends_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_shopping_pins ENABLE ROW LEVEL SECURITY;

-- Affiliate links policies
CREATE POLICY "Creators can view their own affiliate links"
  ON public.affiliate_links FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create affiliate links"
  ON public.affiliate_links FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own affiliate links"
  ON public.affiliate_links FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own affiliate links"
  ON public.affiliate_links FOR DELETE
  USING (auth.uid() = creator_id);

-- Affiliate conversions policies
CREATE POLICY "Creators can view their own conversions"
  ON public.affiliate_conversions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.affiliate_links al 
    WHERE al.id = affiliate_link_id AND al.creator_id = auth.uid()
  ));

-- Creator shops policies
CREATE POLICY "Creator shops are viewable by everyone"
  ON public.creator_shops FOR SELECT
  USING (true);

CREATE POLICY "Creators can create their own shop"
  ON public.creator_shops FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own shop"
  ON public.creator_shops FOR UPDATE
  USING (auth.uid() = creator_id);

-- Live shopping pins policies
CREATE POLICY "Live shopping pins are viewable by everyone"
  ON public.live_shopping_pins FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create pins"
  ON public.live_shopping_pins FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pins"
  ON public.live_shopping_pins FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pins"
  ON public.live_shopping_pins FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_shops_updated_at
  BEFORE UPDATE ON public.creator_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();