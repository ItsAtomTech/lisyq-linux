#include "mainwindow.h"
#include <QApplication>
#include <QPalette>
#include <QDir>
#include <QMessageBox>
#include <QDebug>
#include <QLocalServer>
#include <QLocalSocket>

#define APP_SOCKET_NAME "LiSyQInstance"

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QString filePath = "";
    if (argc > 1) {
        QString arg = QString::fromUtf8(argv[1]);
        if (arg.endsWith(".lsys")) {
            filePath = arg;
        }
    }

    // Try to send to existing instance
    QLocalSocket socket;
    socket.connectToServer(APP_SOCKET_NAME);
    if (socket.waitForConnected(1000)) {
        // Existing instance found
        if (!filePath.isEmpty()) {
            socket.write(filePath.toUtf8());
            socket.flush();
            socket.waitForBytesWritten(1000);
        } else {
            // No file, just bring it up
            socket.write("SHOW");
            socket.flush();
            socket.waitForBytesWritten(1000);
        }
        socket.disconnectFromServer();
        return 0;
    }

    // We are the primary instance
    QLocalServer *server = new QLocalServer(&a);
    QLocalServer::removeServer(APP_SOCKET_NAME);
    if (!server->listen(APP_SOCKET_NAME)) {
        qDebug() << "Failed to start local server:" << server->errorString();
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

    QObject::connect(server, &QLocalServer::newConnection, [&]() {
        QLocalSocket *incoming = server->nextPendingConnection();
        incoming->waitForReadyRead(1000);
        QString received = QString::fromUtf8(incoming->readAll());
        qDebug() << "Instance Call: " << received;

        if (received == "SHOW" || received.isEmpty()) {
            w.raise();
            w.activateWindow();
        } else {
            w.loadFilePath(received);
            w.raise();
            w.activateWindow();
            w.onReady(); //Call the event to execute open assoc
        }
        incoming->deleteLater();
    });

    if (!filePath.isEmpty()) {
        w.loadFilePath(filePath);
    }

    w.show();
    return a.exec();
}
