/**
 * Simply Etsy - An Etsy Shop Plugin
 * http://anigraphiccreations.com/simply-etsy
 *
 * Copyright 2016, Mark McMurray - http://anigraphiccreations.com/
 */

(function($){
	
	var plugin = {};
	
	$.fn.simplyEtsy = function(options) {
		
		if(this.length === 0) {
			return this;
		}
		
		if(this.length > 1){
			this.each(function(){
				$(this).simplyEtsy(options);
				});
			return this;
		}
		
		var plugin = {};
		plugin.el = this;
		
		// FUNCTION: Initialize Gallery
		var init = function() {
			
			plugin.settings = $.extend({
				//DEFAULTS
				api_key: '',
				shop_name: '',
				paginate: 20,
				display_header: true,
				display_title: true,
				display_shop: true,
				display_price: true,
				listing_width: '',
				theme: "light"
			}, options);
			
			initShop();
		};
		
		var initShop = function() {
			var etsyURL = 'https://openapi.etsy.com/v2/shops/' + plugin.settings.shop_name + '.js?&includes=Shop&api_key=' + plugin.settings.api_key;
			$(plugin.el).addClass('simply-etsy simply-etsy--' + plugin.settings.theme);
			
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
									$(plugin.el).append('<div class="simply-etsy__header id-' + shopId + '"></div>');
									$('.simply-etsy__header.id-' + shopId).append('<h2><a href="" + shopUrl + "">' + shopTitle + '</a></h2><p>' + shopWelcome + '</p>');
								}
								
								$(plugin.el).append('<div class="simply-etsy__loading"><div class="loading"></div></div><div class="simply-etsy__listing-container"></div>');
								
								var pages = Math.ceil(shop.listing_active_count / plugin.settings.paginate);
								
								if (pages > 1) {
									$(plugin.el).append('<ul class="simply-etsy__navigation id-' + shopId + '"></ul>');
								
									for (var c = 1; c <= pages; c++) {
										$('.simply-etsy__navigation.id-' + shopId).append('<li><a href="javascript:;">' + (c) + '</a></li>');
									}
									
									$('.simply-etsy__navigation li a').click(function() {
										$('.simply-etsy__navigation li a').removeClass('active');
										$(this).addClass('active');
										getListings(((parseInt($(this).text()) - 1) * plugin.settings.paginate));
									});
								}
							});
						} else {
							initError('No Results', 'The data contains no results. Please try again.');
						}		
					} else {
						initError('JSON Data Error', data.error);
					}
				}
			});
			
			getListings(0);
		};
		
		var getListings = function(offset) {
			
			$('.simply-etsy__listing-container').masonry('destroy');
			
			$('.simply-etsy__listing-container').empty();
			
			$('.simply-etsy__loading').show();
			
			var etsyURL = 'https://openapi.etsy.com/v2/shops/'+plugin.settings.shop_name+'.js?&includes=Listings:active:' + plugin.settings.paginate + ':' + offset + '/Images:1&api_key='+plugin.settings.api_key;
			
			$.ajax({
				url: etsyURL,
				dataType: 'jsonp',
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
										style: 'currency',
										currency: currencyCode,
										currencyDisplay: 'symbol',
										minimumFractionDigits: 2
									});
									var title = listing.title;
	
									$('.simply-etsy__listing-container').append('<div class="simply-etsy__listing id-' + id + '"></div>');
									$('.simply-etsy__listing.id-'+ id).append('<figure class="simply-etsy__listing-image id-' + id + '"></figure>');
									
									if (plugin.settings.display_title) {
										$('.simply-etsy__listing.id-'+ id).append('<div class="simply-etsy__listing-title id-' + id + '"></div>');
										$('.simply-etsy__listing-title.id-'+ id).append('<a href="' + listing.url + '">' + title + '</a>');
									}
									
									if (plugin.settings.display_shop) {
										$('.simply-etsy__listing.id-'+ id).append('<div class="simply-etsy__listing-shop id-' + id + '"></div>');
										$('.simply-etsy__listing-shop.id-'+ id).append('<a href="' + shopUrl + '">' + shopName + '</a>');
									}
									
									if (plugin.settings.display_price) {
										$('.simply-etsy__listing.id-'+ id).append('<div class="simply-etsy__listing-price id-' + id + '"></div>');
										$('.simply-etsy__listing-price.id-'+ id).append('<span class="price">' + price + '</span><span class="currency-code">' + currencyCode + '</span>');
									}
									
									$('.simply-etsy__listing-image.id-'+ id).append($('<img/>').attr('src', listing.Images[0].url_570xN).attr('alt', title));
									$('.simply-etsy__listing-image.id-'+ id + ' img').wrap('<a class="simply-etsy__link" href="' + listing.url + '" title="' + title + '"></a>');
									$('.simply-etsy__listing.id-'+ id).wrapInner('<div class="simply-etsy__listing-inner clearfix"></div>');
								});
							});

							if (plugin.settings.listing_width != '') {
								$('.simply-etsy__listing').css('width', plugin.settings.listing_width);
							}

							$('.simply-etsy__listing').hide();
							$('.simply-etsy__listing-container').imagesLoaded(function() {
								$('.simply-etsy__loading').hide();
								$('.simply-etsy__listing').fadeIn();
								$('.simply-etsy__listing-container').slideDown(function() {
									$('.simply-etsy__listing-container').masonry({
										itemSelector: '.simply-etsy__listing'
									});
								});
							});
						} else {
							initError('No Results', 'The data contains no results. Please try again.');
						}		
					} else {
						initError('JSON Data Error', data.error);
					}
				}
			});
		};
		
		var initError = function(errorTitle, errorDescription) {
			$(plugin.el).empty();			
			$(plugin.el).append('<div class="simply-etsy__error"><p class="simply-etsy__error-title">' + errorTitle + '</p><p class="simply-etsy__error-description">' + errorDescription + '</p></div>');
		};
		
		init();
		
		return this;
		
	};

})(jQuery);