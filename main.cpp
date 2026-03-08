#include "mainwindow.h"

#include <QApplication>
#include <QLockFile>
#include <QDir>
#include <QMessageBox>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QLockFile lockFile(QDir::temp().absoluteFilePath("your_app_name.lock"));

    if (!lockFile.tryLock(100)) {
        QMessageBox::warning(nullptr, "Already Running", "Another instance is already running!");
        return 1;
    }


    MainWindow w;
    w.show();
    return a.exec();
}
