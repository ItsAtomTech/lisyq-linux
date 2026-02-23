#include "Bridge.h"
#include "PortManager.h"
#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QPushButton>
#include <QHBoxLayout>
#include <QWidget>
#include <QWebEngineView>
#include <QWebEnginePage>
#include <QKeyEvent>
#include <QWebChannel>

#include <QWebEngineProfile>
#include <QStandardPaths>
#include <QDir>
#include <QTimer>

#include <QFileInfo>
#include <QUrl>
#include <QFile>
#include <QTextStream>
#include <QMessageBox>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    portManager = new PortManager(this);

    // Create right-side buttons
    QWidget *rightWidget = new QWidget(this);
    QHBoxLayout *buttonLayout = new QHBoxLayout(rightWidget);
    buttonLayout->setContentsMargins(0, 0, 0, 0);
    buttonLayout->setSpacing(5);

    QPushButton *btn1 = new QPushButton("Nest.in", rightWidget);
    QPushButton *btn2 = new QPushButton("Timeline Panel", rightWidget);
    QPushButton *btn3 = new QPushButton("Manual Panel", rightWidget);


    buttonLayout->addWidget(btn1);
    buttonLayout->addWidget(btn2);
    buttonLayout->addWidget(btn3);

    menuBar()->setCornerWidget(rightWidget, Qt::TopRightCorner);

    // Add WebEngineView to mainFrame
    webView = new QWebEngineView(ui->mainFrame);

    // Create or get the default profile
    QWebEngineProfile *profile = new QWebEngineProfile("lisyqProfile", this);

    QString storagePath = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/webengine";
    QDir().mkpath(storagePath);
    profile->setPersistentStoragePath(storagePath);
    profile->setPersistentCookiesPolicy(QWebEngineProfile::ForcePersistentCookies);

    // Optional: also use this profile for the WebView
    webView->setPage(new QWebEnginePage(profile, webView));

    // Adds the Bridge ===========
    Bridge *bridge = new Bridge(this);

    QWebChannel *channel = new QWebChannel(this);
    channel->registerObject("NativeObject", bridge);
    // Adding the Bridge End ====


    QVBoxLayout *frameLayout = new QVBoxLayout(ui->mainFrame);
    frameLayout->setContentsMargins(0, 0, 0, 0);
    frameLayout->addWidget(webView);

    QString path = QCoreApplication::applicationDirPath() + "/main.html";
    webView->load(QUrl::fromLocalFile(path));


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
    asNew = true;


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


}



MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::keyPressEvent(QKeyEvent *event)
{
    if(event->key() == Qt::Key_F12)
    {
        if(devTools->isVisible())
            devTools->hide();
        else
            devTools->show();
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
            }

        })();
        console.log("Native Bridge Injected to runtime");
    )";

    webView->page()->runJavaScript(js);
}


// ==========================
// Bridge inject End    =====
// ==========================



void MainWindow::on_actionOpen_triggered(){
    openLSYSFile();
}


void MainWindow::on_actionSave_triggered(){
    webView->page()->runJavaScript("save_to_file();");
}

void MainWindow::on_actionPort_Configuration_triggered(){
    webView->page()->runJavaScript("openPortConfig();");
}

void MainWindow::on_actionDMX_Config_Patcher_triggered(){
    webView->page()->runJavaScript("openDMXConfig();");
}

void MainWindow::onReady(){
    //---
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

            qDebug() << "Saving File:" << SavePath;
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


