/*
 * Mini Social Games - MsGames
 *
 * jQuery Mini Social Games 1.0
 *
 * MsGames - https://github.com/SrPatinhas/Extensions-Chrome
 * Copyright 2014, MsGames
 *
 * SrPatinhas - https://github.com/SrPatinhas
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

$(function(){


//**************************************************************************************************//
//																									//
//								Basic functions for tooltip and about modal 						//
//																									//
//**************************************************************************************************//

	var $container = $('#container_menu');
	// init
	$container.isotope({
	// options
		itemSelector: '.games',
		masonry: {
			columnWidth: 185,
			gutter: 10
		}
	});
	// filter items on button click
	$(document).on( 'click', '.filter_games', function() {
		var filterValue = $(this).attr('data-filter');
		$container.isotope({ filter: filterValue });
	});
//start the event of the tooltip
	$('.tooltip').tooltipster();
	$('.tooltip_modal').tooltipster({
		position: 'top'
	});
	$(document).on('click', '.open-about', function(e){
		$('#aboutModal').reveal({
					animation: 'fade',						//fade, fadeAndPop, none
					animationspeed: 300,					//how fast animtions are
					closeonbackgroundclick: false,			//if you click background will modal close?
				});
	});
	$(document).on('click', '.link_game', function(e){
		$('#base-home').detach();
		var gameLink = "pages/" + $(this).attr('data-game');
		var game = $(this).attr('game');

		$('#base-games').animate({"width": 500}, 300).load(gameLink, function() {
			if (game == "tetris") {
				t = new Tetris();
			};
		});
		
	});
			var t = '';
			$(document).on('click', '.go_tetris', function(){
				t.gameStart(); this.blur();
			});
			$('.pause_tetris').toggle(
				function(e) {
					t.gamePause(); 
					this.blur(); 
				}, function(e) {
					t.gameResume(); 
					this.blur(); 
			});
			$('.grid_tetris').toggle(
				function(e) {
					t.gamePause(); 
					this.blur(); 
				}, function(e) {
					t.gameResume(); 
					this.blur(); 
			});
			$('.shadow_tetris').toggle(
				function(e){
					t.hideShadow(); 
					this.blur(); 
				},
				function(e){
					t.showShadow(); 
					this.blur(); 
				}
			);
});

//**************************************************************************************************//
//																									//
//							Functions to do on the beginning of extension							//
//																									//
//**************************************************************************************************//

	//set the variables to the initial value
	$(document).ready(function() {


//**************************************************************************************************//
//																									//
//							Fecth cookies that can be already exist									//
//																									//
//**************************************************************************************************//

		chrome.cookies.get({ 
				"name": 'LoL_Font_Champions',
				"url":"http://developer.chrome.com/extensions/cookies.html",
			},function (cookie) {
				if (cookie) {
					console.log(cookie.value);
					var value_cookie = cookie.value;
					var split_cookie = value_cookie.split('&');

					$('#showFont').attr('data-font', split_cookie[0]).text(split_cookie[1]);
				} else {
					console.log('Can\'t get cookie! Check the name!');
				}
			}
		);


//**************************************************************************************************//
//																									//
//							Get Version of current app and check updates 							//
//																									//
//**************************************************************************************************//

		var manifestData = chrome.app.getDetails();

		$.get('update.xml', function(xml){
			$(xml).find('updatecheck').each(function(){
				var $app = $(this); 
				var version = $app.attr("version");
				if (version === manifestData.version) {
					console.info("%s versao atualizada",version);
					$(".version_about").children('span').css('color', 'green').text(manifestData.version);
				} else {
					console.warn("Versao instalada %s",manifestData.version,", versao disponivel ",version);
					$(".version_about").children('span').css('color', 'red').text(version);
				}
			});
		});
	});


//**************************************************************************************************//
//																									//
//										Array with links to search									//
//																									//
//**************************************************************************************************//


		var Live_Font_array = new Array( 
								'http://www.lolking.net/search?name=nickname&region=server',					//lolKing
								'http://www.lolking.net/now/server/nickname',									//lolKing now
								'http://www.lolnexus.com/server/search?name=nickname&region=server',			//LolNexus
								'http://server.op.gg/summoner/userName=nickname',								//OP GG
								'http://www.elophant.com/league-of-legends/search?query=nickname&region=server'	//Elophant
							);


//**************************************************************************************************//
//																									//
//								Search Champion by name on extension								//
//																									//
//**************************************************************************************************//

//search the champions on extension
	$(document).on('keyup', '#search_champion', function(e){
		var searchText = $(this).val().toLowerCase();
		$('.champions_menu>li').each(function(){                
			var currentliID = $(this).attr('id').toLowerCase();
			(currentliID.indexOf(searchText) == 0) ? $(this).show(500) : $(this).hide(500);              
		});
	});


//**************************************************************************************************//
//																									//
//									Full Search Champion selected									//
//																									//
//**************************************************************************************************//

//open the advanced search for mobafire in a new tab
	$('.advanced_search').on('click', function(e){
		var champ = $('#search_name').attr('data-id');
		//Replace "link" on array with the choosen site
		var live = full_search[0];

		var lane = $('#lane_search_base').attr('data-search');
		var role = $('#role_search_base').attr('data-search');
		var map  = $('#map_search_base').attr('data-search');

		//Replace "CHAMP_ID_f", "LANE_f", "ROLE_f", "MAPS_f" on array with the choosen options
		var link_final = live.replace(/CHAMP_ID_f/g, champ);
		link_final = link_final.replace(/LANE_f/g, lane);
		link_final = link_final.replace(/ROLE_f/g, role);
		link_final = link_final.replace(/MAPS_f/g, map);
		console.log(link_final);

		chrome.tabs.create({url:link_final});
	});
//**************************************************************************************************//
//																									//
//							Open Links that dont need any adictional info 							//
//																									//
//**************************************************************************************************//

	$(document).on('click', '.new_link', function(e){
		e.preventDefault();
		chrome.tabs.create({url:$(this).attr('data-href')});
	});
