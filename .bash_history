pkg update -y
pkg install git -y
termux-setup-storage
ls storage/downloads/
cd storage/downloads/clintstore
ls
git init
git add .
git commit -m "update ke supabase"
git config --global user.email "kevinsyawwaluddinfirdaus@gmail.com"
git config --global user.name "yagasuha-dotcom"
git config --global --add safe.directory /storage/emulated/0/Download/clintstore
git add .
git commit -m "update ke supabase"
git branch -M main
git remote add origin https://github.com/yagasuha-dotcom/CLINTSTORE7.git
git push -u origin main --force
cd ~/storage/downloads/clintstore
cp ~/storage/downloads/AdminPayments.jsx src/admin/AdminPayments.jsx
cp ~/storage/downloads/CheckoutPage.jsx src/pages/CheckoutPage.jsx
git add .
git commit -m "fix upload QRIS dan tampilkan QR di checkout"
git push origin main
git pull origin main --rebase
git push origin main
pkg update && pkg upgrade
y
pkg upgrade -y
pkg install nodejs git -y
node -v
git --version
termux-setup-storage
cd ~/storage/downloads
ls
cd ~
unzip ~/storage/downloads/exness-auto-trade-dashboard.zip
cd exness-dashboard
npm install
git init
git add .
git commit -m "init exness auto-trade dashboard"
git branch -M main
git remote add origin https://github.com/yagasuha-dotcom/Sahamforex.git
git push -u origin main
cd ~
unzip PlayPlay.zip
cd PlayPlay
git init
git add .
git commit -m "Initial commit: PlayPlay backend + frontend"
git branch -M main
git remote add origin https://github.com/yagasuha-dotcom/PlayPlay.git
git push -u origin main
cd ~
unzip PlayPlay.zip
cd PlayPlay
cd ~
rm -rf .git
ls ~/PlayPlay
cd ~
rm -rf .git
ls ~/PlayPlay
termux-setup-storage
cd ~
cp /storage/emulated/0/Download/PlayPlay.zip ~/PlayPlay.zip
unzip PlayPlay.zip
ls ~/PlayPlay
cd ~/PlayPlay
pwd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yagasuha-dotcom/PlayPlay.git
git push -u origin main
