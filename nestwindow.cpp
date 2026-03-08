#include "Bridge_Nest.h"
#include "PortManager.h"
#include "nestwindow.h"
#include "./ui_nestwindow.h"
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
#include <QProgressDialog>

#include "mainwindow.h"
#include "Toast.h"

NestWindow::NestWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::NestWindow)
{
    ui->setupUi(this);

    portManager = new PortManager(this);

    // Create right-side buttons
    QWidget *rightWidget = new QWidget(this);
    QHBoxLayout *buttonLayout = new QHBoxLayout(rightWidget);
    buttonLayout->setContentsMargins(0, 0, 0, 0);
    buttonLayout->setSpacing(5);


    //Top Buttons
    btnTimeline = new QPushButton("Studio Panel", rightWidget);



    connect(btnTimeline, &QPushButton::clicked, this, &NestWindow::onTimelineClicked);


    buttonLayout->addWidget(btnTimeline);


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
    Bridge_Nest *bridge = new Bridge_Nest(this);

    QWebChannel *channel = new QWebChannel(this);
    channel->registerObject("NativeObject", bridge);
    // Adding the Bridge End ====


    QVBoxLayout *frameLayout = new QVBoxLayout(ui->mainFrame);
    frameLayout->setContentsMargins(0, 0, 0, 0);
    frameLayout->addWidget(webView);

    QString path = QCoreApplication::applicationDirPath() + "/views/nest_main.html";
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

    webView->setContextMenuPolicy(Qt::NoContextMenu);

    // ==================
    //  Context Menus
    // ==================


    //Timeline Scripts Goes here
    template_menu = new QMenu(this);

    QAction *tmpl_edit   = template_menu->addAction("Edit on Timeline Editor");
    QAction *tmpl_remove = template_menu->addAction("Remove");
    QAction *tmpl_cancel = template_menu->addAction("Cancel");

    connect(tmpl_edit,   &QAction::triggered, this, &NestWindow::onTemplateEditTimeline);
    connect(tmpl_remove, &QAction::triggered, this, &NestWindow::onTemplateRemove);
    connect(tmpl_cancel, &QAction::triggered, this, &NestWindow::onTemplateCancel);


    //Timeline sub script menu
    nestMainMenu = new QMenu(this);

    QAction *removeAction = nestMainMenu->addAction("Remove");
    QAction *detailsAction = nestMainMenu->addAction("Details");
    QAction *trackOptionsAction = nestMainMenu->addAction("Track Options");
    QAction *cancelAction = nestMainMenu->addAction("Cancel");

    connect(removeAction, &QAction::triggered, this, &NestWindow::nestRemove);

    connect(detailsAction, &QAction::triggered,this, &NestWindow::nestDetails);

    connect(trackOptionsAction, &QAction::triggered, this, &NestWindow::nestTrackOptions);

    connect(cancelAction, &QAction::triggered, this, &NestWindow::nestCancel);


}



NestWindow::~NestWindow()
{
    delete ui;
}

void NestWindow::keyPressEvent(QKeyEvent *event)
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
        case Qt::Key_G: code = "KeyG"; break;
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
void NestWindow::resizeEvent(QResizeEvent *event){
    QMainWindow::resizeEvent(event);  // call base implementation
     webView->page()->runJavaScript("gen_ruler();");
}



 // ==========================
 // Bridge inject       ======
 // ==========================
void NestWindow::injectWebChannelScript()
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
void NestWindow::initializeWebChannel()
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


void NestWindow::setActiveButton(QPushButton *active)
{
    QString activeStyle =
        "background-color: gray;"
        "color: white;";

    QString normalStyle = "";

    btnTimeline->setStyleSheet(normalStyle);
    // btnManual->setStyleSheet(normalStyle);

    active->setStyleSheet(activeStyle);
}


void NestWindow::onTimelineClicked()
{

    // minimize NestWindow
    this->showMinimized();

    if(mainWindow)
    {
        // This does not do anything yet, cuases crash for some reason
        //mainWindow->showNormal();
        //mainWindow->raise();
       // mainWindow->activateWindow();
    }

}

// Tool Strips and Others



void NestWindow::on_actionPort_Configuration_triggered(){
    webView->page()->runJavaScript("openPortConfig('port_configurator.html');");
}


void NestWindow::onReady(){
    //---
}


void NestWindow::on_actionSequence_File_triggered(){
    webView->page()->runJavaScript("openLsysFileNS();");
}


void NestWindow::on_actionOpen_triggered(){
    this->Open_File_NT();
}


 // Opening Saving Files goes here ===========
void NestWindow::openFile()
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

    // Escape content safely for JavaScript
    QString safeContent = fileContent;
    safeContent.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "");

    QString safePath = fileName;
    safePath.replace("\\", "\\\\");

    QString js = QString("load_from_file('%1', \"%2\");")
                     .arg(safeContent)
                     .arg(safePath);

    webView->page()->runJavaScript(js);


    Toast *toast = new Toast(this);
    toast->showMessage("File: " + fileName + " is now loading.",
                       QColor("green"),
                       QColor("white"),2000);

}


void Bridge_Nest::Open_File(){
    if(nestWindow) {
        nestWindow->openFile();
    }
}


void Bridge_Nest::put_data_nt(const QString &data)
{
    if (nestWindow)
        nestWindow->data_string_nt = data;
}


void Bridge_Nest::Save_File_NT()
{
    nestWindow->saveFileNT();
}



void NestWindow::on_actionSave_triggered(){
    webView->page()->runJavaScript("save_to_file_nt();");
}


void NestWindow::saveFileNT()
{
    QString fileName;

    if (SaveNestedTLPath.isEmpty() || NTAsnew)
    {
        fileName = QFileDialog::getSaveFileName(
            this,
            "Save Nested Project Timeline File",
            QDir::homePath(),
            "Lisyq Nested Project Timeline Files (*.ntlis)"
            );

        if (!fileName.isEmpty())
        {
            // Ensure the file has the .ntlis extension
            if (!fileName.endsWith(".ntlis", Qt::CaseInsensitive))
                fileName += ".ntlis";

            QFile file(fileName);
            if (file.open(QIODevice::WriteOnly | QIODevice::Text))
            {
                QTextStream out(&file);
                out << data_string_nt;
                file.close();

                SaveNestedTLPath = fileName;
                NTAsnew = false;

                QMessageBox::information(
                    this,
                    "Saved",
                    "File saved to: " + SaveNestedTLPath
                    );
            }
        }
        else
        {
            if (SaveNestedTLPath.isEmpty())
                NTAsnew = true;
        }
    }
    else
    {
        QFile file(SaveNestedTLPath);
        if (file.open(QIODevice::WriteOnly | QIODevice::Text))
        {
            QTextStream out(&file);
            out << data_string_nt;
            file.close();


            Toast *toast = new Toast(this);
            toast->showMessage("Saving File: " + SaveNestedTLPath,
                               QColor("green"),
                               QColor("white"),
                               5000);


        }
    }
}
// Saving Files end        ===========


void NestWindow::Open_File_NT()
{
    QString fileName;

    // If a file is already open
    if (!SaveNestedTLPath.isEmpty())
    {
        QMessageBox::StandardButton reply;

        reply = QMessageBox::question(
            this,
            "Open New",
            "You are about to load a file and close currently open file.\n"
            "Save changes first.\n\nContinue to Load?",
            QMessageBox::Yes | QMessageBox::No,
            QMessageBox::No
            );

        if (reply != QMessageBox::Yes)
            return;
    }

    // Open dialog
    fileName = QFileDialog::getOpenFileName(
        this,
        "Open Nested Timeline File",
        QDir::homePath(),
        "Lisyq Nested Project Timeline Files (*.ntlis)"
        );

    if (fileName.isEmpty())
        return;

    // Optional progress dialog (simple version)
    QProgressDialog progress("Loading file...", QString(), 0, 0, this);
    progress.setWindowModality(Qt::WindowModal);
    progress.show();

    // Read file
    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return;

    QTextStream in(&file);
    QString fileContent = in.readAll();
    file.close();

    // Escape content safely for JS
    fileContent.replace("\\", "\\\\");
    fileContent.replace("'", "\\'");
    fileContent.replace("\n", "\\n");
    fileContent.replace("\r", "");

    // Send to WebView
    webView->page()->runJavaScript(
        QString("load_from_file_nt('%1');").arg(fileContent)
        );

    // Save path
    SaveNestedTLPath = fileName;
    NTAsnew = false;
    progress.close();

}



void NestWindow::openFilePL()
{
    // If a playlist is already loaded
    if (!SavePlayListPath.isEmpty())
    {
        QMessageBox::StandardButton reply;
        reply = QMessageBox::question(
            this,
            "Open New",
            "You are about to load a file and close the currently open file.\n"
            "Save changes first. Continue to Load?",
            QMessageBox::Yes | QMessageBox::No
            );

        if (reply != QMessageBox::Yes)
            return;
    }

    QString fileName = QFileDialog::getOpenFileName(
        this,
        "Open Playlist File",
        QDir::homePath(),
        "Lisyq playlist Files (*.lips)"
        );

    if (fileName.isEmpty())
        return;

    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return;

    QTextStream in(&file);
    QString fileContent = in.readAll();
    file.close();

    // Escape for JavaScript safety
    fileContent.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "");

    QString js = QString("load_pl_from_file('%1');")
                     .arg(fileContent);

    webView->page()->runJavaScript(js);

    SavePlayListPath = fileName;


    Toast *toast = new Toast(this);
    toast->showMessage( "File: " + SavePlayListPath + " is now loading.",
                       QColor("green"),
                       QColor("white"),
                       5000);

}


void Bridge_Nest::Open_File_PL(){
    if (!nestWindow) return;
    nestWindow->openFilePL();
}

void NestWindow::saveFilePL()
{
    QString fileName;

    if (SavePlayListPath.isEmpty() || Asnew)
    {
        fileName = QFileDialog::getSaveFileName(
            this,
            "Save Playlist File",
            QDir::homePath(),
            "Lisyq Playlist Files (*.lips)"
            );

        if (!fileName.isEmpty())
        {
            // Ensure .lips extension
            if (!fileName.endsWith(".lips", Qt::CaseInsensitive))
                fileName += ".lips";

            QFile file(fileName);
            if (file.open(QIODevice::WriteOnly | QIODevice::Text))
            {
                QTextStream out(&file);
                out << data_string_pl;
                file.close();

                SavePlayListPath = fileName;
                Asnew = false;
                Toast *toast = new Toast(this);
                toast->showMessage( "File saved to: " + SavePlayListPath,
                                   QColor("green"),
                                   QColor("white"),
                                   5000);

            }
        }
        else
        {
            if (SavePlayListPath.isEmpty())
                Asnew = true;
        }
    }
    else
    {
        QFile file(SavePlayListPath);
        if (file.open(QIODevice::WriteOnly | QIODevice::Text))
        {
            QTextStream out(&file);
            out << data_string_pl;
            file.close();
            Toast *toast = new Toast(this);
            toast->showMessage("Saving File: " + SavePlayListPath,
                               QColor("green"),
                               QColor("white"),
                               5000);
        }
        return;
    }
}


void Bridge_Nest::Save_File_PL(){
    if (!nestWindow) return;
    nestWindow->saveFilePL();
}


void Bridge_Nest::put_pl_data(const QString &data){
    if (!nestWindow) return;
    nestWindow->data_string_pl = data;
}


// ================================
// PORT Channel Management
// ================================



void NestWindow::addComPort(int index, const QString &portname)
{
    portManager->addSerialPort(index, portname);
}

void NestWindow::removeComPort(int index)
{
    portManager->removeSerialPort(index, true);
}

void NestWindow::addUdpChannel(int index, const QString &address, int port)
{
    portManager->addUdpChannel(index, address, port);
}

void NestWindow::removeUdpChannel(int index)
{
    portManager->removeUdpChannel(index);
}

QString NestWindow::getSystemComPortsJson()
{
    return portManager->getSystemPortsJson();
}

QString NestWindow::getManagedPortsJson()
{
    return portManager->getManagedPortsJson();
}

QString NestWindow::getUdpListJson()
{
    return portManager->getUdpListJson();
}


void NestWindow::setDf(const QString &data)
{
    if (portManager)
        portManager->setDf(data);
}


void NestWindow::outputs_v2()
{
    if (portManager)
        portManager->outputs_v2();
}

void NestWindow::ComingSoon()
{
    Toast *toast = new Toast(this);
    toast->showMessage("This Feature is coming soon...",
                       QColor("gold"),
                       QColor("black"),
                       2000);
}



bool Bridge_Nest::add_comport(int index, const QString &portname)
{
    if (!nestWindow) return false;
    nestWindow->addComPort(index, portname);
    return true;
}

bool Bridge_Nest::add_udpchannel(int index, const QString &address, int port)
{
    if (!nestWindow) return false;
    nestWindow->addUdpChannel(index, address, port);
    return true;
}

QString Bridge_Nest::get_udplist_json()
{
    if (!nestWindow) return "{}";
    return nestWindow->getUdpListJson();
}

void Bridge_Nest::disconnect_udp(int index)
{
    if (!nestWindow) return;
    nestWindow->removeUdpChannel(index);
}

QString Bridge_Nest::get_comlist()
{
    if (!nestWindow) return "{}";
    return nestWindow->getSystemComPortsJson();
}

QString Bridge_Nest::get_comports()
{
    if (!nestWindow) return "{}";
    return nestWindow->getManagedPortsJson();
}

void Bridge_Nest::disconnect_com(int index)
{
    if (!nestWindow) return;
    nestWindow->removeComPort(index);
}


//Getting the Data
void Bridge_Nest::set_values(int port, const QString &data)
{
    Q_UNUSED(port); // placeholder like VB

    if (!nestWindow)
        return;

    nestWindow->setDf(data);
}

void Bridge_Nest::outputs(){
    nestWindow->outputs_v2();
}


//get file content using a filepath
QString Bridge_Nest::open_filePath(const QString &filePath)
{
    QFile file(filePath);

    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
    {
        QMessageBox::warning(nullptr,
                             "Failed Loading",
                             "Failed Loading: " + filePath);
        return "";
    }

    QTextStream in(&file);
    QString fileContent = in.readAll();
    file.close();

    return fileContent;
}


//Context Menus

// Script Template Menu
void NestWindow::Show_template_scriptmenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    template_menu->exec(globalPos);
}

void Bridge_Nest::Show_template_scriptmenu(){
    nestWindow->Show_template_scriptmenu();
}

void NestWindow::onTemplateEditTimeline()
{
    // webView->page()->runJavaScript("editTemplateOnTimeline();");
    this->ComingSoon();
}

void NestWindow::onTemplateRemove()
{
     webView->page()->runJavaScript("remove_scriptstub();");
}

void NestWindow::onTemplateCancel()
{
    // Usually do nothing — menu closes automatically
}





// Script Sub Template Menu
void NestWindow::Show_content_scriptmenu(){
    QPoint globalPos = QCursor::pos();   // show at mouse position
    nestMainMenu->exec(globalPos);
}

void Bridge_Nest::Show_content_menu(){
    nestWindow->Show_content_scriptmenu();
}


void NestWindow::nestRemove()
{
    webView->page()->runJavaScript("remove_subtrack();");
}

void NestWindow::nestDetails()
{
    this->ComingSoon();
    webView->page()->runJavaScript("nest_details();");
}

void NestWindow::nestTrackOptions()
{
    webView->page()->runJavaScript("nest_track_options();");
}

void NestWindow::nestCancel()
{
    // Menu auto-closes — usually no code needed
}


