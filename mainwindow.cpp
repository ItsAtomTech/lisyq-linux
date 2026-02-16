#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QPushButton>
#include <QHBoxLayout>
#include <QWidget>
#include <QWebEngineView>
#include <QWebEnginePage>
#include <QKeyEvent>


#include <QFile>
#include <QTextStream>







MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

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

    QVBoxLayout *frameLayout = new QVBoxLayout(ui->mainFrame);
    frameLayout->setContentsMargins(0, 0, 0, 0);
    frameLayout->addWidget(webView);

    QString path = QCoreApplication::applicationDirPath() + "/main.html";
    webView->load(QUrl::fromLocalFile(path));


    devTools = new QWebEngineView(); // no parent
    webView->page()->setDevToolsPage(devTools->page());
    devTools->resize(800, 600);



    SavePath = "";
    FromOpenFile = false;
    asNew = true;


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


void MainWindow::on_actionOpen_triggered(){
    openLSYSFile();
}




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
