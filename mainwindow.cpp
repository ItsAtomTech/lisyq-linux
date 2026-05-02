#include "Bridge.h"
#include "PortManager.h"
#include "mainwindow.h"
#include "nestwindow.h"
#include "./ui_mainwindow.h"
#include <QPushButton>
#include <QHBoxLayout>
#include <QWidget>
#include <QWebEngineView>
#include <QWebEnginePage>
#include <QKeyEvent>
#include <QWebChannel>
#include <QWebEngineSettings>

#include <QWebEngineProfile>
#include <QStandardPaths>
#include <QDir>
#include <QTimer>

#include <QFileInfo>
#include <QUrl>
#include <QFile>
#include <QTextStream>
#include <QMessageBox>

#include "Toast.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(nullptr)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    portManager = new PortManager(this);
    //this->setObjectName("MainWindow");

    // Create right-side buttons
    QWidget *rightWidget = new QWidget(this);
    QHBoxLayout *buttonLayout = new QHBoxLayout(rightWidget);
    buttonLayout->setContentsMargins(0, 0, 0, 0);
    buttonLayout->setSpacing(5);


    //Top Buttons
    btnNest = new QPushButton("Nest.in", rightWidget);
    btnTimeline = new QPushButton("Timeline Panel", rightWidget);
    btnManual   = new QPushButton("Manual Panel", rightWidget);


    connect(btnTimeline, &QPushButton::clicked, this, &MainWindow::onTimelineClicked);
    connect(btnManual, &QPushButton::clicked, this, &MainWindow::onManualClicked);
    connect(btnNest, &QPushButton::clicked, this, &MainWindow::openNestWindow);


    buttonLayout->addWidget(btnNest);
    buttonLayout->addWidget(btnTimeline);
    buttonLayout->addWidget(btnManual);


    menuBar()->setCornerWidget(rightWidget, Qt::TopRightCorner);

    // Add WebEngineView to mainFrame
    webView = new QWebEngineView(ui->mainFrame);

    // In constructor
    QString storagePath = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/webengine";
    QDir().mkpath(storagePath);

    profile = new QWebEngineProfile("lisyqProfile");
    profile->setPersistentStoragePath(storagePath);
    profile->setCachePath(storagePath + "/cache");
    profile->setPersistentCookiesPolicy(QWebEngineProfile::ForcePersistentCookies);
    profile->setHttpCacheType(QWebEngineProfile::DiskHttpCache);

    page = new QWebEnginePage(profile);
    webView->setPage(page);

    // Enable local storage and persistent data
    QWebEngineSettings *settings = page->settings();
    settings->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);


    // Adds the Bridge ===========
    Bridge *bridge = new Bridge(this);

    QWebChannel *channel = new QWebChannel(this);
    channel->registerObject("NativeObject", bridge);
    // Adding the Bridge End ====


    QVBoxLayout *frameLayout = new QVBoxLayout(ui->mainFrame);
    frameLayout->setContentsMargins(0, 0, 0, 0);
    frameLayout->addWidget(webView);

    QTimer::singleShot(500, this, [this]() {
        QString path = QCoreApplication::applicationDirPath() + "/main.html";
        webView->load(QUrl::fromLocalFile(path));
    });


    connect(webView, &QWebEngineView::loadFinished, this,
            [this](bool ok)
            {
                if (!ok) return;

                injectWebChannelScript();

                // Slight delay to ensure script loads
                QTimer::singleShot(10, this, [this]() {
                    initializeWebChannel();
                });
            });

    webView->page()->setWebChannel(channel);

    devTools = new QWebEngineView(); // still no parent
    devTools->setPage(new QWebEnginePage(profile, devTools));

    // Attach DevTools to the main webView
    webView->page()->setDevToolsPage(devTools->page());
    devTools->resize(800, 600);

    SavePath = "";
    FromOpenFile = false;
    asNew = false;


    // ==================
    //  Context Menus
    // ==================


    //content menu
    contextMenu_Sub = new QMenu(this);

    QAction *consub_edit = contextMenu_Sub->addAction("Edit");
    QAction *consub_remove = contextMenu_Sub->addAction("Remove");
    QAction *consub_copy = contextMenu_Sub->addAction("Copy");
    QAction *consub_trackoption = contextMenu_Sub->addAction("Track Options");
    QAction *consub_addtotemplate = contextMenu_Sub->addAction("Add to Templates");

    connect(consub_edit, &QAction::triggered, this, &MainWindow::onContextEdit);
    connect(consub_remove, &QAction::triggered, this, &MainWindow::onContextRemove);
    connect(consub_copy, &QAction::triggered, this, &MainWindow::onContextCopy);
    connect(consub_trackoption, &QAction::triggered, this, &MainWindow::onContextTrackOptions);
    connect(consub_addtotemplate, &QAction::triggered, this, &MainWindow::onContextAddToTemplate);


    //track_options
    contextMenu_Track = new QMenu(this);

    QAction *consub_add_track = contextMenu_Track->addAction("Add New Track");

    submenu_add_track_at = new QMenu("Add New Track At:", this);
        contextMenu_Track->addMenu(submenu_add_track_at);

        trackIndexEdit = new QLineEdit(this);
        trackIndexEdit->setPlaceholderText("Enter index...");
        trackIndexEdit->setFixedWidth(120);

        trackIndexWidgetAction = new QWidgetAction(this);
        trackIndexWidgetAction->setDefaultWidget(trackIndexEdit);

        submenu_add_track_at->addAction(trackIndexWidgetAction);
        QAction *confirmAction = submenu_add_track_at->addAction("Select");
        connect(confirmAction, &QAction::triggered, this, &MainWindow::handleAddTrackAt);

    connect(consub_add_track, &QAction::triggered, this, &MainWindow::handleAddTrack);

    submenu_duplicate = new QMenu("Duplicate", this);
    contextMenu_Track->addMenu(submenu_duplicate);

    QAction *dupAfter = submenu_duplicate->addAction("After");
    QAction *dupBefore = submenu_duplicate->addAction("Before");

    connect(dupAfter, &QAction::triggered, this, &MainWindow::duplicateAfter);
    connect(dupBefore, &QAction::triggered, this, &MainWindow::duplicateBefore);

    submenu_duplicate_at = new QMenu("At Position:", this);
    submenu_duplicate->addMenu(submenu_duplicate_at);

        duplicateIndexEdit = new QLineEdit(this);
        duplicateIndexEdit->setPlaceholderText("Enter index...");
        duplicateIndexEdit->setFixedWidth(120);

            duplicateIndexWidgetAction = new QWidgetAction(this);
            duplicateIndexWidgetAction->setDefaultWidget(duplicateIndexEdit);

            submenu_duplicate_at->addAction(duplicateIndexWidgetAction);

            QAction *dupSelect = submenu_duplicate_at->addAction("Select");
            connect(dupSelect, &QAction::triggered, this, &MainWindow::duplicateAtPosition);
        QAction *dupStart = submenu_duplicate->addAction("Start of Timeline");
        QAction *dupEnd = submenu_duplicate->addAction("End of Timeline");


        connect(dupStart, &QAction::triggered, this, &MainWindow::duplicateStart);
        connect(dupEnd, &QAction::triggered, this, &MainWindow::duplicateEnd);

        submenu_edit_track = new QMenu("Edit Track", this);
        contextMenu_Track->addMenu(submenu_edit_track);
            QAction *editPortChannelAction = submenu_edit_track->addAction("Port and Channel");

            connect(editPortChannelAction, &QAction::triggered,
                    this, &MainWindow::editPortChannel);

        QAction *removeAction = contextMenu_Track->addAction("Remove");
        connect(removeAction, &QAction::triggered, this, &MainWindow::removeTrack);
        // ================
        contextMenu_Track->addSeparator();

        QAction *pasteAction = contextMenu_Track->addAction("Paste (Content)");
        connect(pasteAction, &QAction::triggered, this, &MainWindow::pasteContent);

    // Template Menu ==============
    template_menu = new QMenu(this);

    QAction *editAction = template_menu->addAction("Edit Template");
    QAction *removeActionTemplate = template_menu->addAction("Remove");
    QAction *cancelAction = template_menu->addAction("Cancel");

    template_menu->addSeparator();

    QAction *sendManualAction = template_menu->addAction("Send to Manual Templ.");

    connect(editAction, &QAction::triggered,
            this, &MainWindow::editTemplate);

    connect(removeActionTemplate, &QAction::triggered,
            this, &MainWindow::removeTemplate);

    connect(cancelAction, &QAction::triggered,
            this, &MainWindow::cancelTemplate);

    connect(sendManualAction, &QAction::triggered,
            this, &MainWindow::sendToManualTemplate);



    //Manual Template Menu ===========
    template_menu_manual = new QMenu(this);

    QAction *tmpl_edit   = template_menu_manual->addAction("Edit Template");
    QAction *tmpl_remove = template_menu_manual->addAction("Remove");
    QAction *tmpl_cancel = template_menu_manual->addAction("Cancel");
    QAction *tmpl_add    = template_menu_manual->addAction("Add to Timeline Templ.");

    connect(tmpl_edit,   &QAction::triggered, this, &MainWindow::onTemplateEdit);
    connect(tmpl_remove, &QAction::triggered, this, &MainWindow::onTemplateRemove);
    connect(tmpl_cancel, &QAction::triggered, this, &MainWindow::onTemplateCancel);
    connect(tmpl_add,    &QAction::triggered, this, &MainWindow::onTemplateAddToTimeline);


    // nestWindow = new NestWindow(this);
}





MainWindow::~MainWindow()
{
    webView->setPage(nullptr);
    delete page;
    page = nullptr;
    delete profile;
    profile = nullptr;
}

void MainWindow::keyPressEvent(QKeyEvent *event)
{
    if(event->key() == Qt::Key_F12)
    {
        if(devTools->isVisible())
            devTools->hide();
        else
            devTools->show();

    }else{
        QString key = event->text();
        QString code = "";
        bool ctrlKey = event->modifiers() & Qt::ControlModifier;
        bool shiftKey = event->modifiers() & Qt::ShiftModifier;

        // Map Qt keys to JS `code` strings
        switch(event->key())
        {
        case Qt::Key_S: code = "KeyS"; break;
        case Qt::Key_O: code = "KeyO"; break;
        case Qt::Key_Q: code = "KeyQ"; break;
        case Qt::Key_V: code = "KeyV"; break;
        case Qt::Key_C: code = "KeyC"; break;
        case Qt::Key_Z: code = "KeyZ"; break;
        case Qt::Key_Y: code = "KeyY"; break;
        case Qt::Key_T: code = "KeyT"; break;
        case Qt::Key_P: code = "KeyP"; break;
        case Qt::Key_M: code = "KeyM"; break;
        case Qt::Key_Space: code = "Space"; break;
        case Qt::Key_Plus:
        case Qt::Key_Equal: code = "Equal"; break;
        case Qt::Key_Minus: code = "Minus"; break;
        default: break;
        }

        if(!code.isEmpty())
        {
            QString js = QString(
                             "shortcuts({"
                             "   key: '%1',"
                             "   code: '%2',"
                             "   ctrlKey: %3,"
                             "   shiftKey: %4,"
                             "   target: { tagName: '', getAttribute: function(){ return null; } },"
                             "   preventDefault: function(){}"
                             "});"
                             )
                             .arg(key.isEmpty() ? code : key)
                             .arg(code)
                             .arg(ctrlKey ? "true" : "false")
                             .arg(shiftKey ? "true" : "false");

            webView->page()->runJavaScript(js);
        }
    }
    QMainWindow::keyPressEvent(event); // pass to default
}




//On window Resize
void MainWindow::resizeEvent(QResizeEvent *event){
    QMainWindow::resizeEvent(event);  // call base implementation
     webView->page()->runJavaScript("gen_ruler();");
}



 // ==========================
 // Bridge inject       ======
 // ==========================
void MainWindow::injectWebChannelScript()
{
    QString js = R"(
        (function() {
            if (typeof QWebChannel === 'undefined') {
                var script = document.createElement('script');
                script.setAttribute("comment", "Auto Generated By QT Bridge");
                script.src = 'qrc:///qtwebchannel/qwebchannel.js';
                script.type = 'text/javascript';
                document.head.appendChild(script);
            }
        })();
    )";

    webView->page()->runJavaScript(js);
}


// This Mimics the Webview2 Host Object
void MainWindow::initializeWebChannel()
{
    QString js = R"(
        (function() {

            if (typeof QWebChannel === 'undefined') {
                var script = document.createElement('script');
                script.src = 'qrc:///qtwebchannel/qwebchannel.js';
                script.onload = setupChannel;
                document.head.appendChild(script);
            } else {
                setupChannel();
            }

            function setupChannel() {
                new QWebChannel(qt.webChannelTransport, function(channel) {

                    // Ensure structure exists
                    window.chrome = window.chrome || {};
                    window.chrome.webview = window.chrome.webview || {};
                    window.chrome.webview.hostObjects = window.chrome.webview.hostObjects || {};

                    // Assign NativeObject exactly like WebView2
                    window.chrome.webview.hostObjects.NativeObject =
                        channel.objects.NativeObject;
                });

                //Try to send readySignal to native.

            }

        })();
        console.log("Native Bridge Injected to runtime");


        setTimeout(stateReadyQT, 500);
        function stateReadyQT(){
            window.chrome.webview.hostObjects.NativeObject.onReady();
            console.log("Native Bridge Ready");

        }


    )";

    webView->page()->runJavaScript(js);
}


// ==========================
// Bridge inject End    =====
// ==========================


void MainWindow::setActiveButton(QPushButton *active)
{
    QString activeStyle =
        "background-color: gray;"
        "color: white;";

    QString normalStyle = "";

    btnTimeline->setStyleSheet(normalStyle);
    btnManual->setStyleSheet(normalStyle);

    active->setStyleSheet(activeStyle);
}


void MainWindow::onTimelineClicked()
{
    setActiveButton(btnTimeline);
    webView->page()->runJavaScript("modeSelect('timeline');");
}

void MainWindow::onManualClicked()
{
    setActiveButton(btnManual);
    webView->page()->runJavaScript("modeSelect('manual');");
}

void MainWindow::openNestWindow()
{
    if (nestWindow == nullptr) {
        nestWindow = new NestWindow(this);
    }

    nestWindow->show();
    nestWindow->raise();
    nestWindow->activateWindow();

    //this->showMinimized();
}




// Tool Strips and Others

void MainWindow::on_actionOpen_triggered(){
    openLSYSFile();
}


void MainWindow::on_actionSave_triggered(){
    webView->page()->runJavaScript("save_to_file();");
}


void MainWindow::on_actionSave_As_triggered(){
    asNew = true;
    webView->page()->runJavaScript("save_to_file();");
}


void MainWindow::on_actionSettings_and_Option_triggered(){
    webView->page()->runJavaScript("createDialogue('settings','')");
}



void MainWindow::on_actionNew_triggered()
{
    if (SavePath.isEmpty()){
        Toast *toast = new Toast(this);
        toast->showMessage("No Currently Opened File!",
                           QColor("yellow"),
                           QColor("black"), 1500);
        return;
    }

    QMessageBox::StandardButton reply = QMessageBox::question(
        this,
        "New Project",
        "Are you sure to start a new Project File? This will clear your current work so make sure to save it.",
        QMessageBox::Yes | QMessageBox::No
        );

    if (reply == QMessageBox::Yes) {
        SavePath = "";
        asNew = true;
        webView->page()->runJavaScript("new_refresh(true)");
    } else {
        Toast *toast = new Toast(this);
        toast->showMessage("Action Canceled",
                           QColor("yellow"),
                           QColor("black"), 1500);
    }
}


void MainWindow::on_actionPort_Configuration_triggered(){
    webView->page()->runJavaScript("openPortConfig();");
}

void MainWindow::on_actionDMX_Config_Patcher_triggered(){
    webView->page()->runJavaScript("openDMXConfig();");
}

void MainWindow::on_actionImport_Templates_triggered(){
    webView->page()->runJavaScript("openImportTemplates();");
}


void MainWindow::onReady(){
    // ======
    // Open from File Assocs if provided from args
    // =====
    if(OpenQuePath.length() <= 0){
        return;
    }

    if (SavePath.length() > 0) {
        QMessageBox::StandardButton confirm_loadnew = QMessageBox::question(
            this,
            "Open New",
            "You are about to load this file and close currently open file so save changes first, Continue to Load?",
            QMessageBox::Yes | QMessageBox::No
            );

        if (confirm_loadnew != QMessageBox::Yes) {
            return;
        }
    }



    QFile file(OpenQuePath);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return;

    QTextStream in(&file);
    QString fileContent = in.readAll();
    file.close();


    // Escape single quotes for JS
    fileContent.replace("'", "\\'");

    webView->page()->runJavaScript(
        "load_from_file('" + fileContent + "');"
        );
    SavePath=OpenQuePath;
    OpenQuePath = "";
    asNew = false;

    Toast *toast = new Toast(this);
    toast->showMessage("Opening File: " + SavePath,
                       QColor("green"),
                       QColor("white"),2000);

    // ======
    // Open from File End
    // =====


}


void MainWindow::loadFilePath(const QString &filePath)
{
    OpenQuePath = filePath;
}


void MainWindow::on_actionAdd_New_Track_triggered(){
    webView->page()->runJavaScript("add_track();");
}



 // Saving Files goes here ===========

void Bridge::put_data(const QString &data){
    if(mainWindow) {
        mainWindow->data_string = data;

    }
}



void Bridge::Save_To_File()
{
    if (mainWindow) {
        mainWindow->Save_File();
    }
}


bool Bridge::AsNewTrigger(){
    if(mainWindow) {
        if(mainWindow->FromOpenFile == true){
              return false;
        }

        mainWindow->asNew = true;
        mainWindow->SavePath = "";

        return true;
    }

    return false;

}


void MainWindow::Save_File()
{
    if (SavePath.isEmpty() || asNew)
    {
        QString defaultFileName = QDir::homePath() + "/LSYS file.lsys";

        QString fileName = QFileDialog::getSaveFileName(
            this,
            "Save File",
            defaultFileName,
            "LSYS Files (*.lsys)"
            );

        if (!fileName.isEmpty())
        {
            // Ensure the file has .lsys extension
            if (!fileName.endsWith(".lsys", Qt::CaseInsensitive))
                fileName += ".lsys";

            QFile file(fileName);
            if (file.open(QIODevice::WriteOnly | QIODevice::Text))
            {
                QTextStream out(&file);
                out << data_string;
                file.close();

                SavePath = fileName;
                asNew = false;

                qDebug() << "Saved to:" << SavePath;
            }
        }
        else
        {
            if (SavePath.isEmpty())
                asNew = true;
        }
    }
    else
    {
        QFile file(SavePath);
        if (file.open(QIODevice::WriteOnly | QIODevice::Text))
        {
            QTextStream out(&file);
            out << data_string;
            file.close();
            Toast *toast = new Toast(this);
            toast->showMessage("Saving File: " + SavePath,
                               QColor("green"),
                               QColor("white"),2000);

        }
    }

    FromOpenFile = false;
}

// Saving Files end        ===========







// Opens a Native File Picker for .lsys files
void MainWindow::openLSYSFile()
{
    QString fileName = QFileDialog::getOpenFileName(
        this,
        "Open LSYS File",
        QDir::homePath(),
        "LSYS Files (*.lsys)"
        );

    if (fileName.isEmpty())
        return;

    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return;

    QTextStream in(&file);
    QString fileContent = in.readAll();
    file.close();

    // Escape single quotes for JS
    fileContent.replace("'", "\\'");

    webView->page()->runJavaScript(
        "load_from_file('" + fileContent + "');"
        );

    SavePath = fileName;
    FromOpenFile = false;
    asNew = false;
}


bool Bridge::Open_FileDirectory()
{
    if (!mainWindow) return false;

    mainWindow->Open_FileDirectory_Native();
    return true;
}

//Opens a Media file picker, which can provide native link info
void MainWindow::Open_FileDirectory_Native()
{
    QString filePath = QFileDialog::getOpenFileName(
        this,
        "Select A Media File",
        "",
        ""
        );

    if (!filePath.isEmpty())
    {
        // Escape path for JS
        QString escapedPath = QUrl::fromLocalFile(filePath).toString();

        // Call JS function
        webView->page()->runJavaScript(
            QString("setMediaPath('%1');").arg(escapedPath)
            );

        // To-DO: Optional toast notification

    }
}




// ================================
// PORT Channel Management
// ================================



void MainWindow::addComPort(int index, const QString &portname)
{
    portManager->addSerialPort(index, portname);
}

void MainWindow::removeComPort(int index)
{
    portManager->removeSerialPort(index, true);
}

void MainWindow::addUdpChannel(int index, const QString &address, int port)
{
    portManager->addUdpChannel(index, address, port);
}

void MainWindow::removeUdpChannel(int index)
{
    portManager->removeUdpChannel(index);
}

QString MainWindow::getSystemComPortsJson()
{
    return portManager->getSystemPortsJson();
}

QString MainWindow::getManagedPortsJson()
{
    return portManager->getManagedPortsJson();
}

QString MainWindow::getUdpListJson()
{
    return portManager->getUdpListJson();
}


void MainWindow::setDf(const QString &data)
{
    if (portManager)
        portManager->setDf(data);
}


void MainWindow::outputs_v2()
{
    if (portManager)
        portManager->outputs_v2();
}





bool Bridge::add_comport(int index, const QString &portname)
{
    if (!mainWindow) return false;
    mainWindow->addComPort(index, portname);
    return true;
}

bool Bridge::add_udpchannel(int index, const QString &address, int port)
{
    if (!mainWindow) return false;
    mainWindow->addUdpChannel(index, address, port);
    return true;
}

QString Bridge::get_udplist_json()
{
    if (!mainWindow) return "{}";
    return mainWindow->getUdpListJson();
}

void Bridge::disconnect_udp(int index)
{
    if (!mainWindow) return;
    mainWindow->removeUdpChannel(index);
}

QString Bridge::get_comlist()
{
    if (!mainWindow) return "{}";
    return mainWindow->getSystemComPortsJson();
}

QString Bridge::get_comports()
{
    if (!mainWindow) return "{}";
    return mainWindow->getManagedPortsJson();
}

void Bridge::disconnect_com(int index)
{
    if (!mainWindow) return;
    mainWindow->removeComPort(index);
}


QString Bridge::onReady(){

    mainWindow->onReady();
    qDebug() << "QPath Loaded: "+ mainWindow->OpenQuePath;
    return "_";
}


//Getting the Data
void Bridge::set_values(int port, const QString &data)
{
    Q_UNUSED(port); // placeholder like VB

    if (!mainWindow)
        return;

    mainWindow->setDf(data);
}

void Bridge::outputs(){
    mainWindow->outputs_v2();
}


void MainWindow::sendToComPort(const QString &portName, const QString &data)
{
    if (_serialPort == nullptr) {
        _serialPort = new QSerialPort(this);
        _serialPort->setPortName(portName);
        _serialPort->setBaudRate(QSerialPort::Baud115200);
        _serialPort->setDataBits(QSerialPort::Data8);
        _serialPort->setParity(QSerialPort::NoParity);
        _serialPort->setStopBits(QSerialPort::OneStop);
    }

    if (!_serialPort->isOpen()) {
        if (!_serialPort->open(QIODevice::ReadWrite)) {
            Toast *toast = new Toast(this);
            toast->showMessage("Failed to open " + portName, QColor("red"), QColor("white"), 3000);
            return;
        }
        _serialPort->setDataTerminalReady(false);
        Toast *toast = new Toast(this);
        toast->showMessage("Opened " + portName, QColor("green"), QColor("white"), 2000);
    }

    qint64 bytesWritten = _serialPort->write((data + "\n").toUtf8());

    if (bytesWritten == -1) {
        Toast *toast = new Toast(this);
        toast->showMessage("Write failed: " + _serialPort->errorString(), QColor("red"), QColor("white"), 3000);
    }else{
        Toast *toast = new Toast(this);
        toast->showMessage("Written to " + portName, QColor("green"), QColor("white"), 2000);
    }

    _serialPort->flush();
    _serialPort->close();

}



void Bridge::SendToComPort(const QString &portName, const QString &data){
     mainWindow->sendToComPort(portName,data);
}



//Context Menus
void MainWindow::showContentSubMenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    contextMenu_Sub->exec(globalPos);
}


void Bridge::Show_content_menu(){
    mainWindow->showContentSubMenu();
}


void MainWindow::onContextEdit()
{
    webView->page()->runJavaScript("open_edit_for(timeline_data[selected_track_index].sub_tracks[selected_content.getAttribute('content_id')], 'edit')");
}

void MainWindow::onContextRemove()
{
    webView->page()->runJavaScript("remove_content()");
}

void MainWindow::onContextCopy()
{
    webView->page()->runJavaScript("copy_content();");
}

void MainWindow::onContextTrackOptions()
{
    //Open the Track Option Context Menu
    QPoint globalPos = QCursor::pos();   // show at mouse position
    contextMenu_Track->exec(globalPos);
}

void MainWindow::onContextAddToTemplate()
{
    webView->page()->runJavaScript("sendToTimelineTemplates();");
}


// Track Context Menu
void MainWindow::showTrackMenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    contextMenu_Track->exec(globalPos);
}


void Bridge::Show_track_menu(){
    mainWindow->showTrackMenu();
}


void MainWindow::handleAddTrack()
{
    webView->page()->runJavaScript("add_track()");
}

void MainWindow::handleAddTrackAt()
{
    bool ok;
    int index = trackIndexEdit->text().toInt(&ok);

    if (ok){

        QString script;
        if (index < 0) {
            script = "add_track();";
        } else {
            script = QString("add_track(%1);").arg(index);
        }
        webView->page()->runJavaScript(script);


        qDebug() << "Add track at index:" << index;
    }

}


void MainWindow::duplicateAfter()
{
    webView->page()->runJavaScript("duplicateTrack('after');");
}

void MainWindow::duplicateBefore()
{
    webView->page()->runJavaScript("duplicateTrack('before');");
}

void MainWindow::duplicateAtPosition()
{
    bool ok;
    int index = duplicateIndexEdit->text().toInt(&ok);

    if(ok && index >= 0)
        webView->page()->runJavaScript(
            QString("duplicateTrack(%1);").arg(index)
            );
}

void MainWindow::duplicateStart()
{
    webView->page()->runJavaScript("duplicateTrack(0);");
}

void MainWindow::duplicateEnd()
{
    webView->page()->runJavaScript("duplicateTrack();");
}

void MainWindow::editPortChannel()
{
    webView->page()->runJavaScript("edit_track_option();");
}


void MainWindow::removeTrack()
{
    QMessageBox::StandardButton reply;

    reply = QMessageBox::question(
        this,
        "Remove Track",
        "You are about to remove this track.\nAll contents of it will be removed as well.",
        QMessageBox::Yes | QMessageBox::No
        );

    if (reply == QMessageBox::Yes)
    {
        webView->page()->runJavaScript("remove_track();");
    }
}



void MainWindow::pasteContent()
{
    webView->page()->runJavaScript("paste_content();");
}




//Template Menus


void MainWindow::showTemplateMenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    template_menu->exec(globalPos);
}

void Bridge::Show_template_menu(){
    mainWindow->showTemplateMenu();
}

// To-Do: Fix DOM context menu on js adds a lot of context event listener every call


void MainWindow::editTemplate()
{
    webView->page()->runJavaScript("edit_template();");
}

void MainWindow::removeTemplate()
{
    QMessageBox::StandardButton reply;

    reply = QMessageBox::question(
        this,
        "Remove Template",
        "You are about to remove this template.",
        QMessageBox::Yes | QMessageBox::No
        );

    if (reply == QMessageBox::Yes)
    {
        webView->page()->runJavaScript("remove_template();");
    }
}


void MainWindow::cancelTemplate()
{
    // Just close menu if needed
}

void MainWindow::sendToManualTemplate()
{
    webView->page()->runJavaScript("sendToManualTemplates();");
}



// Manual Template Menus ==============================

void MainWindow::showManualTemplateMenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    template_menu_manual->exec(globalPos);
}


void Bridge::Show_manual_template_menu(){
    mainWindow->showManualTemplateMenu();
}

void MainWindow::onTemplateEdit()
{
    webView->page()->runJavaScript("edit_template();");
}

void MainWindow::onTemplateRemove()
{
    QMessageBox::StandardButton reply;

    reply = QMessageBox::question(
        this,
        "Remove Template",
        "You are about to remove this template.",
        QMessageBox::Yes | QMessageBox::No
        );

    if (reply == QMessageBox::Yes)
    {
        webView->page()->runJavaScript("remove_template();");
    }

}

void MainWindow::onTemplateCancel()
{
    // If you just want to close menu, do nothing
    // Or call JS if needed
}

void MainWindow::onTemplateAddToTimeline()
{
    webView->page()->runJavaScript("sendToTimeTemplates();");
}

