#ifndef BRIDGE_H
#define BRIDGE_H


#include <QWebChannel>
#include <QObject>


class MainWindow; // forward declaration

class Bridge : public QObject
{
    Q_OBJECT

public:
    explicit Bridge(MainWindow *mw = nullptr, QObject *parent = nullptr)
        : QObject(parent), mainWindow(mw) {}

public slots:
    void put_data(const QString &data);
    void Save_To_File();
    bool AsNewTrigger();

    void onReady(){}

    // ================================
    // New PORT Channel Management
    // ================================

    bool add_comport(int index, const QString &portname);
    bool add_udpchannel(int index, const QString &address, int port);
    QString get_udplist_json();
    void disconnect_udp(int index);
    QString get_comlist();
    QString get_comports();
    void disconnect_com(int index);


private:
    MainWindow *mainWindow; // pointer to the MainWindow instance
};





#endif // BRIDGE_H
