/**
 * EtsyShopPlugin - Display a responsive Etsy shop on Website
 * http://anigraphiccreations.com/EtsyShopPlugin
 *
 * Copyright 2015, Mark McMurray - http://anigraphiccreations.com/
 */

(function($){
	
	var plugin = {};
	
	$.fn.etsyShopPlugin = function(options) {
		
		if(this.length === 0) {
			return this;
		}
		
		if(this.length > 1){
			this.each(function(){
				$(this).etsyShopPlugin(options);
				});
			return this;
		}
		
		var plugin = {};
		plugin.el = this;
		
		// FUNCTION: Initialize Gallery
		var init = function() {
			
			plugin.settings = $.extend({
				//DEFAULTS
				api_key: "",
				store_name: "",
				paginate: 20,
				display_header: true,
				display_title: true,
				display_shop: true,
				display_price: true,
				theme: "light"
			}, options);
			
			initShop();
		};
		
		var initShop = function() {
			var etsyURL = "https://openapi.etsy.com/v2/shops/" + plugin.settings.store_name + ".js?&includes=Shop&api_key=" + plugin.settings.api_key;
			$(plugin.el).addClass("etsy-shop-plugin etsy-" + plugin.settings.theme);
			
			$.ajax({
				url: etsyURL,
				dataType: 'jsonp',
				success: function(data) {
					if (data.ok) {
						if (data.count > 0) {
							$.each(data.results, function(i,shop) {
								var shopId = shop.shop_id;
								var shopTitle = shop.title;
								var shopUrl = shop.url;
								var shopWelcome = shop.policy_welcome;
								
								if (plugin.settings.display_header) {
									$(plugin.el).append("<div class=\"etsy-header id-" + shopId + "\"></div>");
									$(".etsy-header.id-" + shopId).append("<h2><a href=\"" + shopUrl + "\">" + shopTitle + "</a></h2><p>" + shopWelcome + "</p>");
								}
								
								$(plugin.el).append("<div class=\"etsy-loading\"><div class=\"loading\"></div><!--loading--></div><!--etsy-loading--><div class=\"etsy-listing-container\"></div><!--etsy-listing-container-->");
								
								var pages = shop.listing_active_count / plugin.settings.paginate;
								
								$(plugin.el).append("<ul class=\"etsy-navigation id-" + shopId + "\"></ul>");
								
								for (var c = 1; c < pages; c++) {
									$(".etsy-navigation.id-" + shopId).append("<li><a href=\"javascript:;\">" + (c) + "</a></li>");
								}
								
								$(".etsy-navigation li a").click(function() {
									$(".etsy-navigation li a").removeClass("active");
									$(this).addClass("active");
									getListings((parseInt($(this).text()) * plugin.settings.paginate));
								});
							});
						} else {
							initError("No Results", "The data contains no results. Please try again.");
						}		
					} else {
						initError("JSON Data Error", data.error);
					}
				}
			});
			
			getListings(0);
		};
		
		var getListings = function(offset) {
			
			$(".etsy-listing-container").masonry("destroy");
			
			$(".etsy-listing-container").empty();
			
			$(".etsy-loading").show();
			
			var etsyURL = "https://openapi.etsy.com/v2/shops/"+plugin.settings.store_name+".js?&includes=Listings:active:" + plugin.settings.paginate + ":" + offset + "/Images:1&api_key="+plugin.settings.api_key;
			
			$.ajax({
				url: etsyURL,
				dataType: "jsonp",
				success: function(data) {
					if (data.ok) {
						if (data.count > 0) {
							$.each(data.results, function(i,shop) {
								
								var shopName = shop.shop_name;
								var shopUrl = shop.url;
								
								$.each(shop.Listings, function(i,listing) {
									var id = listing.listing_id;
									var currencyCode = listing.currency_code;
									var price = parseFloat(listing.price).toLocaleString(listing.language , {
										style: "currency",
										currency: currencyCode,
										currencyDisplay: "symbol",
										minimumFractionDigits: 2
									});
									var title = listing.title;
	
									$(".etsy-listing-container").append("<div class=\"etsy-listing id-"+ id + "\"></div><!--etsy-listing-->");
									$(".etsy-listing.id-"+ id).append("<div class=\"etsy-listing-image id-"+ id + "\"></div><!--etsy-listing-image-->");
									
									if (plugin.settings.display_title) {
										$(".etsy-listing.id-"+ id).append("<div class=\"etsy-listing-title id-"+ id + "\"></div><!--etsy-listing-title-->");
										$(".etsy-listing-title.id-"+ id).append("<a href='" + listing.url + "'>" + title + "</a>");
									}
									
									if (plugin.settings.display_shop) {
										$(".etsy-listing.id-"+ id).append("<div class=\"etsy-listing-shop id-"+ id + "\"></div><!--etsy-listing-shop-->");
										$(".etsy-listing-shop.id-"+ id).append("<a href='" + shopUrl + "'>" + shopName + "</a>");
									}
									
									if (plugin.settings.display_price) {
										$(".etsy-listing.id-"+ id).append("<div class=\"etsy-listing-price id-"+ id + "\"></div><!--etsy-listing-price-->");
										$(".etsy-listing-price.id-"+ id).append("<span class=\"price\">" + price + "</span><span class=\"currency-code\"> " + currencyCode + "</span>");
									}
									
									$(".etsy-listing-image.id-"+ id).append($("<img/>").attr("src", listing.Images[0].url_570xN).attr("alt", title));
									$(".etsy-listing-image.id-"+ id + " img").wrap(
										"<a class=\"etsy-link\" href=\"" + listing.url + "\" title=\"" + title + "\"></a>"
									);
									$(".etsy-listing.id-"+ id).wrapInner("<div class=\"etsy-listing-inner clearfix\"></div><!--etsy-listing-inner-->");
								});
							});
							$(".etsy-listing").hide();
							$(".etsy-listing-container").imagesLoaded(function() {
								$(".etsy-loading").hide();
								$(".etsy-listing").fadeIn();
								$(".etsy-listing-container").slideDown(function() {
									$(".etsy-listing-container").masonry({
										itemSelector: ".etsy-listing"
									});
								});
							});
						} else {
							initError("No Results", "The data contains no results. Please try again.");
						}		
					} else {
						initError("JSON Data Error", data.error);
					}
				}
			});
		};
		
		var initError = function(errorTitle, errorDescription) {
			$(plugin.el).empty();			
			$(plugin.el).append("<div class=\"etsy-error\"><p class=\"etsy-error-title\">" + errorTitle + "</p><p class=\"etsy-error-description\">" + errorDescription + "</p></div>");
		};
		
		init();
		
		return this;
		
	};

})(jQuery);