const { app, BrowserWindow, Tray, Menu } = require('electron/main')
const path = require('path')
const fs = require('fs')

let tray = null
let win = null

const createWindow = () => {
  win = new BrowserWindow({
    title: 'Electron App',
    width: 800,
    height: 600,
    resizable: false, // Impede o redimensionamento
    maximizable: false, // Impede a maximização
    icon: path.join(__dirname, 'favicon.ico') // Define o ícone da janela
  })

  win.loadFile('index.html') //ou win.loadURL('https://...')
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
  tray = new Tray(path.join(__dirname, 'favicon.ico')) // Usa o favicon.ico como ícone

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