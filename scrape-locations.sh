download_locations () {
	curl https://api.$1.com/v1/pins?types=gym | jq . > ./data/$1-locations.json
	echo "Downloaded ./data/$1-locations.json"
}

download_locations auroraboardapp
download_locations decoyboardapp
download_locations grasshopperboardapp
download_locations kilterboardapp
download_locations soillboardapp
download_locations tensionboardapp2
download_locations touchstoneboardapp
