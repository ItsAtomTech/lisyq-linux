#include "mainwindow.h"

#include <QApplication>
#include <QLockFile>
#include <QPalette>
#include <QDir>
#include <QMessageBox>
#include <QDebug>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QLockFile lockFile(QDir::temp().absoluteFilePath("your_app_name.lock"));

    if (!lockFile.tryLock(100)) {
        QMessageBox::warning(nullptr, "Already Running", "Another instance is already running!");
        return 1;
    }


    a.setStyle("Fusion");

    QPalette darkPalette = a.palette();
    darkPalette.setColor(QPalette::Window,     QColor(40, 40, 40));
    darkPalette.setColor(QPalette::Base,       QColor(30, 30, 30));
    darkPalette.setColor(QPalette::WindowText, QColor(254, 254, 255));
    darkPalette.setColor(QPalette::Text,       QColor(254, 254, 255));
    darkPalette.setColor(QPalette::Button,     QColor(40, 40, 40));
    darkPalette.setColor(QPalette::ButtonText, QColor(254, 254, 255));
    darkPalette.setColor(QPalette::Highlight,  QColor(62, 62, 62));
    a.setPalette(darkPalette);


    MainWindow w;
    w.show();
    return a.exec();
}
