const { app, BrowserWindow, Tray, Menu, screen } = require('electron/main')
const path = require('path')
const fs = require('fs')

let tray = null
let win = null

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workArea // Obtém a área de trabalho disponível (sem a barra de tarefas)

  const windowWidth = 340
  const windowHeight = 160
  const windowOffset = 7 // Offset para o posicionamento da janela

  win = new BrowserWindow({
    title: 'RadioWebPlayer',
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth + windowOffset, // Calcula a posição horizontal (canto direito)
    y: height - windowHeight + windowOffset, // Calcula a posição vertical (acima da bandeja)
    resizable: false, // Impede o redimensionamento
    maximizable: false, // Impede a maximização
    icon: path.join(__dirname, 'favicon.ico') // Define o ícone da janela
  })

  //win.loadFile('index.html')  
  win.loadURL('https://thilsc.github.io/RadioWebPlayer/')
  win.setMenu(null) // Remove o menu padrão
  win.setAlwaysOnTop(true) // Mantém a janela sempre no topo  
  win.setSkipTaskbar(true) // Remove a janela da barra de tarefas
  win.setVisibleOnAllWorkspaces(true) // Torna a janela visível em todas as áreas de trabalho

  // Evento para minimizar a janela na bandeja
  win.on('minimize', (event) => {
    event.preventDefault()
    win.hide() // Oculta a janela
  })
}

app.whenReady().then(() => {
  createWindow()

  // Cria o ícone da bandeja
  const iconPath = path.join(__dirname, 'favicon.ico')
 
  // Verifica se o arquivo favicon.ico existe
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath) // Usa o favicon.ico como ícone
  } else {
    tray = new Tray(path.join(__dirname, 'default-icon.png')) // Ícone alternativo
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Restaurar', click: () => win.show() },
    { label: 'Sair', click: () => app.quit() }
  ])
  tray.setToolTip(win.getTitle()) // Usa o título da janela como texto ao passar o mouse sobre o ícone
  tray.setContextMenu(contextMenu)

  // Evento para restaurar a janela ao clicar no ícone da bandeja
  tray.on('click', () => {
    win.show()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})