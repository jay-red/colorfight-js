# AttackCell
#	Global Configuration
"		Max gold take time"
"		Max energy take time"
"		Max normal take time"
#
"	Expansion - Randomly choose a cell, evaluate on take times"
"		Recharge Frequency"
"		Loot Frequency"
"		Attack Frequecy"
#		Defend Frequency
"	Recharge - Attack the closest cell to energy"
"		When"
"			Energy Cell Num < or > ???"
"		Yes or No"
"		Accurate or Precise"
"		Priorties"
"			Only pursue empty"
"			Only pursue enemy"
"			Pursue empty before enemy"
"			Pursue enemy before empty"
"			Pursue whichever is closest"
#		Follow with random attack, yes or no
"	Loot - Attack the closest cell to gold"
"		When"
"			Gold Cell num < or > ???"
"		Yes or No"
"		Accurate or Precise"
"		Priorties"
"			Only pursue empty"
"			Only pursue enemy"
"			Pursue empty before enemy"
"			Pursue enemy before empty"
#		Follow with random attack, yes or no
#	Attack - Attack the closest cell to enemy base
#		When
#			My Energy Cell Num < or > ???
#			My Gold Cell Num < or > ???
#			Their Energy Cell Num < or > ???
#			Their Gold Cell Num < or > ???
#			Their Base Num < or > ???
#	Defend - Attack your own cells
#		Randomly
#		Near Base, within radius ???
#
#AttackCell Boosted
#	Random - Boost when Energy < or > ???
#	Gold - Boost when Energy < or > ???
#	Energy - Boost when Energy < or > ???
#
"BuildBase"
"	Location"
"		Random"
#		Clustered
#		Far away from enemy
#		Far away from each other
#	Attack build cell? yes or no
#
#Blast
#	Adjacent or Distant - Blasting cells that you can take, versus far away
#	Adjacent:
#
#	Distant - An aggresive attack on players:
#		When:
#			Energy Cells > ???
#			Energy > ???
#		Gold Value ???
#		Energy Value ???
#		Base Value ???
#		Normal Cell Value ???
#		Minimum Blast Value ???
#
#MultiAttack
#	When:
#		Gold Cells > ???
#		Gold > ???
#		Bases > ???
#		Cells > ??? 